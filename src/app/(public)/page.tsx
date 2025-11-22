import { createClient } from '@/lib/supabase/server';
import { EventsPageClient } from '@/components/events/EventsPageClient';

export default async function EventsPage() {
  const supabase = createClient();

  // Get filtered events for LIST VIEW (upcoming/ongoing only)
  const currentDate = new Date().toISOString();
  const { data: upcomingEvents } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'published')
    .or(`event_date.gte.${currentDate},event_end_date.gte.${currentDate}`)
    .order('event_date', { ascending: true });

  // Get past events for LIST VIEW
  const { data: pastEvents } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'published')
    .lt('event_date', currentDate)
    .or(`event_end_date.lt.${currentDate},event_end_date.is.null`)
    .order('event_date', { ascending: false });

  // Get ALL published events for CALENDAR VIEW (past, present, future)
  const { data: allPublishedEvents } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'published')
    .order('event_date', { ascending: true });

  return (
    <EventsPageClient
      upcomingEvents={upcomingEvents || []}
      pastEvents={pastEvents || []}
      allEvents={allPublishedEvents || []}
    />
  );
}
