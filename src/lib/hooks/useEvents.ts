'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Event, EventWithRSVP } from '@/types/database.types';

interface UseEventsOptions {
  eventType?: string;
  status?: 'upcoming' | 'past' | 'all';
  includeUserRSVP?: boolean;
}

export function useEvents(options: UseEventsOptions = {}) {
  const [events, setEvents] = useState<EventWithRSVP[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchEvents() {
      try {
        let query = supabase
          .from('events')
          .select('*')
          .eq('status', 'published');

        // Filter by date
        const currentDate = new Date().toISOString();
        if (options.status === 'upcoming') {
          // Show events that are starting in the future OR currently ongoing
          query = query.or(`event_date.gte.${currentDate},event_end_date.gte.${currentDate}`);
        } else if (options.status === 'past') {
          // Show events that have ended (both start and end dates are in the past)
          query = query.lt('event_date', currentDate)
            .or(`event_end_date.lt.${currentDate},event_end_date.is.null`);
        }

        // Filter by type
        if (options.eventType) {
          query = query.eq('event_type', options.eventType);
        }

        query = query.order('event_date', { ascending: options.status !== 'past' });

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;

        // If user wants RSVPs, fetch them separately
        if (options.includeUserRSVP) {
          const { data: { user } } = await supabase.auth.getUser();

          if (user) {
            const eventIds = data?.map(e => e.id) || [];
            const { data: attendees } = await supabase
              .from('event_attendees')
              .select('*')
              .eq('member_id', user.id)
              .in('event_id', eventIds);

            const eventsWithAttendees = data?.map(event => ({
              ...event,
              user_attendee: attendees?.find(a => a.event_id === event.id),
            })) || [];

            setEvents(eventsWithAttendees);
          } else {
            setEvents(data || []);
          }
        } else {
          setEvents(data || []);
        }

        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();

    // Real-time subscription
    const channel = supabase
      .channel('events-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'events',
      }, () => {
        fetchEvents();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [options.eventType, options.status]);

  return { events, loading, error };
}
