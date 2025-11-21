import { createClient } from '@/lib/supabase/server';
import { EventsPageClient } from '@/components/events/EventsPageClient';

export default async function EventsPage() {
  const supabase = createClient();

  const { data: events } = await supabase
    .from('events')
    .select('*, event_attendees(count)')
    .eq('status', 'published')
    .gte('event_date', new Date().toISOString())
    .order('event_date', { ascending: true });

  return <EventsPageClient events={events || []} />;
}
