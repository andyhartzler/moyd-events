'use client';

import { useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

function buildRSVPMatchingFilters(user: User) {
  const filters = [
    `member_id.eq.${user.id}`,
    user.email ? `guest_email.eq.${user.email}` : '',
    user.phone ? `guest_phone.eq.${user.phone}` : '',
  ];

  return filters.filter(Boolean).join(',');
}

export function useRSVP() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const rsvp = async (eventId: string, guestCount: number = 0) => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Please log in to RSVP');

      // Check if user already has a record (e.g., from previous cancellation)
      const { data: existingRsvp } = await supabase
        .from('event_attendees')
        .select('id')
        .eq('event_id', eventId)
        .or(buildRSVPMatchingFilters(user))
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingRsvp) {
        // Update existing record to 'attending'
        const { error: updateError } = await supabase
          .from('event_attendees')
          .update({
            rsvp_status: 'attending',
            guest_count: guestCount,
          })
          .eq('event_id', eventId)
          .or(buildRSVPMatchingFilters(user));

        if (updateError) throw updateError;
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('event_attendees')
          .insert({
            event_id: eventId,
            member_id: user.id,
            rsvp_status: 'attending',
            guest_count: guestCount,
          });

        if (insertError) throw insertError;
      }

      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { rsvp, loading, error };
}
