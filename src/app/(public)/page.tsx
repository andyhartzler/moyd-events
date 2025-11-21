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

  // Now get filtered events
  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'published')
    .gte('event_date', new Date().toISOString())
    .order('event_date', { ascending: true });

  console.log('=== DEBUG: FILTERED EVENTS ===');
  console.log('Current date for comparison:', new Date().toISOString());
  console.log('Filtered events (published + future):', events?.length || 0);
  console.log('Filtered events data:', JSON.stringify(events, null, 2));

  if (error) {
    console.error('Error fetching events:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
  }

  return <EventsPageClient events={events || []} />;
}
