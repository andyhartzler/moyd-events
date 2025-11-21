import { createClient } from '@/lib/supabase/server';
import { EventsPageClient } from '@/components/events/EventsPageClient';

export default async function EventsPage() {
  const supabase = createClient();

  // First, let's try to get ALL events without any filters to debug
  const { data: allEvents, error: allError } = await supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: true });

  console.log('=== DEBUG: ALL EVENTS ===');
  console.log('Total events in database:', allEvents?.length || 0);
  console.log('All events:', JSON.stringify(allEvents, null, 2));
  if (allError) {
    console.error('Error fetching all events:', allError);
  }

  // Get filtered events for LIST VIEW (upcoming/ongoing only)
  const currentDate = new Date().toISOString();
  const { data: upcomingEvents, error } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'published')
    .or(`event_date.gte.${currentDate},event_end_date.gte.${currentDate}`)
    .order('event_date', { ascending: true });

  console.log('=== DEBUG: FILTERED EVENTS (for list view) ===');
  console.log('Current date for comparison:', new Date().toISOString());
  console.log('Filtered events (published + future):', upcomingEvents?.length || 0);
  console.log('Filtered events data:', JSON.stringify(upcomingEvents, null, 2));

  if (error) {
    console.error('Error fetching events:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
  }

  // Get ALL published events for CALENDAR VIEW (past, present, future)
  const { data: allPublishedEvents, error: allPublishedError } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'published')
    .order('event_date', { ascending: true });

  console.log('=== DEBUG: ALL PUBLISHED EVENTS (for calendar view) ===');
  console.log('All published events:', allPublishedEvents?.length || 0);

  if (allPublishedError) {
    console.error('Error fetching all published events:', allPublishedError);
  }

  return (
    <EventsPageClient
      upcomingEvents={upcomingEvents || []}
      allEvents={allPublishedEvents || []}
    />
  );
}
