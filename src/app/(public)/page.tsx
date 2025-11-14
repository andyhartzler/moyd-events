import { createClient } from '@/lib/supabase/server';
import { EventCard } from '@/components/events/EventCard';
import { Calendar } from 'lucide-react';

export default async function EventsPage() {
  const supabase = createClient();

  const { data: events } = await supabase
    .from('events')
    .select('*, event_rsvps(count)')
    .eq('status', 'published')
    .gte('event_date', new Date().toISOString())
    .order('event_date', { ascending: true });

  return (
    <div className="py-12">
      <div className="container-custom">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#273351] mb-4">
            Upcoming Events
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Join us at our upcoming events and be part of the change you want to see in Missouri.
          </p>
        </div>

        {/* Events Grid */}
        {events && events.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-12 max-w-md mx-auto">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Upcoming Events</h3>
              <p className="text-gray-600">Check back soon for new events and opportunities to get involved!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
