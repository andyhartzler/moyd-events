import { notFound } from 'next/navigation';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { RSVPButton } from '@/components/events/RSVPButton';
import { formatEventDate } from '@/lib/utils/formatters';

export default async function EventDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!event) notFound();

  // Check if user has RSVPd
  const { data: { user } } = await supabase.auth.getUser();
  let hasRSVPd = false;

  if (user) {
    const { data: rsvp } = await supabase
      .from('event_rsvps')
      .select('id')
      .eq('event_id', params.id)
      .eq('member_id', user.id)
      .single();

    hasRSVPd = !!rsvp;
  }

  // Get RSVP count
  const { count } = await supabase
    .from('event_rsvps')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', params.id)
    .eq('rsvp_status', 'attending');

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-[#273351] text-white p-8">
          <h1 className="text-4xl font-bold mb-4">{event.title}</h1>
          <div className="flex items-center text-white/90">
            <Calendar className="w-5 h-5 mr-2" />
            <span>{formatEventDate(event.event_date)}</span>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {event.location && (
            <div className="flex items-start">
              <MapPin className="w-5 h-5 mr-3 mt-1 text-gray-600" />
              <div>
                <div className="font-semibold">Location</div>
                <div className="text-gray-600">{event.location}</div>
                {event.location_address && (
                  <div className="text-sm text-gray-500">{event.location_address}</div>
                )}
              </div>
            </div>
          )}

          {count !== null && (
            <div className="flex items-center">
              <Users className="w-5 h-5 mr-3 text-gray-600" />
              <div>
                <span className="font-semibold">{count} RSVPs</span>
                {event.max_attendees && (
                  <span className="text-gray-600"> / {event.max_attendees} max</span>
                )}
              </div>
            </div>
          )}

          {event.description && (
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap">{event.description}</div>
            </div>
          )}

          {event.rsvp_enabled && (
            <div className="pt-6 border-t">
              <RSVPButton eventId={event.id} hasRSVPd={hasRSVPd} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
