import { createClient } from '@/lib/supabase/server';
import { EventsPageClient } from '@/components/events/EventsPageClient';

export default async function EventsPage() {
  const supabase = createClient();

  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'published')
    .gte('event_date', new Date().toISOString())
    .order('event_date', { ascending: true });

  if (error) {
    console.error('Error fetching events:', error);
  }

  return <EventsPageClient events={events || []} />;
}
