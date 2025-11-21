import { notFound } from 'next/navigation';
import { Calendar, MapPin, Clock, ArrowLeft, Share2, Info } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { RSVPButton } from '@/components/events/RSVPButton';
import { ShareButton } from '@/components/events/ShareButton';
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
      .from('event_attendees')
      .select('id')
      .eq('event_id', params.id)
      .eq('member_id', user.id)
      .single();

    hasRSVPd = !!rsvp;
  }

  // Get attendee count from the event record (updated automatically by trigger)
  const count = event.attendee_count || 0;

  const attendancePercentage = event.max_attendees && count
    ? Math.round((count / event.max_attendees) * 100)
    : 0;

  return (
    <div className="py-8">
      {/* Back Button */}
      <div className="container-custom mb-6">
        <Link
          href="/"
          className="inline-flex items-center text-white hover:opacity-70 font-medium transition-opacity"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Link>
      </div>

      {/* Main Content */}
      <div className="container-custom py-4">
        <div className="max-w-7xl mx-auto">
          {/* Event Header */}
          <div className="mb-8">
            {event.event_type && (
              <span className="inline-block bg-white/20 backdrop-blur-sm text-white px-4 py-1 rounded-full text-sm font-semibold uppercase tracking-wide mb-4">
                {event.event_type}
              </span>
            )}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              {event.title}
            </h1>
            <div className="flex flex-wrap gap-6 text-white text-lg">
              <div className="flex items-center">
                <Calendar className="w-6 h-6 mr-2 text-white" />
                <span>{formatEventDate(event.event_date)}</span>
              </div>
              {event.location && (
                <div className="flex items-center">
                  <MapPin className="w-6 h-6 mr-2 text-white" />
                  <span>{event.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Description and Location Row */}
          <div className="space-y-8 mb-8">
            {/* Description */}
            {event.description && (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-soft p-8">
                <h2 className="text-2xl font-bold text-[#273351] mb-4 flex items-center">
                  <Info className="w-6 h-6 mr-3" />
                  About This Event
                </h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {event.description}
                  </p>
                </div>
              </div>
            )}

            {/* Location Details */}
            {event.location && (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-soft p-8">
                <h2 className="text-2xl font-bold text-[#273351] mb-4 flex items-center">
                  <MapPin className="w-6 h-6 mr-3" />
                  Location
                </h2>
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-gray-900">{event.location}</p>
                  {event.location_address && (
                    <p className="text-gray-600">{event.location_address}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Cards Row - Horizontal on Desktop, Vertical on Mobile */}
          {event.rsvp_enabled && (
            <div className="grid md:grid-cols-3 gap-6">
              {/* RSVP Card */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-medium p-6 border-2 border-[#273351]/20">
                <h3 className="text-xl font-bold text-[#273351] mb-4">RSVP for Event</h3>

                <RSVPButton eventId={event.id} hasRSVPd={hasRSVPd} />

                {hasRSVPd && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800 font-medium">
                      ✓ You're registered for this event!
                    </p>
                  </div>
                )}
              </div>

              {/* Event Details Card */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-soft p-6">
                <h3 className="text-lg font-bold text-[#273351] mb-4">Event Details</h3>
                <div className="space-y-4 text-sm">
                  <div className="flex items-start space-x-3">
                    <Calendar className="w-5 h-5 text-[#273351] mt-0.5" />
                    <div>
                      <div className="font-semibold text-gray-700">Date & Time</div>
                      <div className="text-gray-600">{formatEventDate(event.event_date)}</div>
                    </div>
                  </div>

                  {event.rsvp_deadline && (
                    <div className="flex items-start space-x-3">
                      <Clock className="w-5 h-5 text-[#273351] mt-0.5" />
                      <div>
                        <div className="font-semibold text-gray-700">RSVP Deadline</div>
                        <div className="text-gray-600">
                          {formatEventDate(event.rsvp_deadline)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Share Card */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center shadow-soft">
                <Share2 className="w-8 h-8 text-[#273351] mx-auto mb-3" />
                <h3 className="font-bold text-[#273351] mb-2">Share This Event</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Help spread the word about this event
                </p>
                <ShareButton title={event.title} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
