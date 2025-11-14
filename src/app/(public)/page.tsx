import { createClient } from '@/lib/supabase/server';
import { EventCard } from '@/components/events/EventCard';

export default async function HomePage() {
  const supabase = createClient();

  const { data: events } = await supabase
    .from('events')
    .select('*, event_rsvps(count)')
    .eq('status', 'published')
    .gte('event_date', new Date().toISOString())
    .order('event_date', { ascending: true })
    .limit(6);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[#273351] mb-4">
          Missouri Young Democrats Events
        </h1>
        <p className="text-xl text-gray-600">
          Join us in building a better Missouri
        </p>
      </div>

      {events && events.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600">No upcoming events at this time.</p>
        </div>
      )}
    </div>
  );
}
