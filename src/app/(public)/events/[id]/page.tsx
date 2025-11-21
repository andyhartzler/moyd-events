import { notFound } from 'next/navigation';
import { Calendar, MapPin, Clock, ArrowLeft, Share2, Info } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { RSVPButton } from '@/components/events/RSVPButton';
import { ShareButton } from '@/components/events/ShareButton';
import { EventMap } from '@/components/events/EventMap';
import { formatEventDate } from '@/lib/utils/formatters';
import { parseEventSlug } from '@/lib/utils/slugify';

export default async function EventDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  // Try to parse as slug first, fallback to UUID
  const slugData = parseEventSlug(params.id);

  let event;

  if (slugData) {
    // Query by title pattern and date range
    const { data: events } = await supabase
      .from('events')
      .select('*')
      .gte('event_date', slugData.dateStart)
      .lte('event_date', slugData.dateEnd)
      .ilike('title', `%${slugData.titlePattern}%`)
      .eq('status', 'published')
      .limit(1)
      .single();

    event = events;
  } else {
    // Fallback to UUID lookup for backward compatibility
    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('id', params.id)
      .single();

    event = data;
  }

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
          className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all"
          aria-label="Back to Events"
        >
          <ArrowLeft className="w-5 h-5" />
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

            {/* RSVP Button - Above Location */}
            {event.rsvp_enabled && (
              <div className="flex flex-col items-center gap-4">
                <div className="w-full max-w-md">
                  <RSVPButton eventId={event.id} hasRSVPd={hasRSVPd} />
                </div>
                {hasRSVPd && (
                  <div className="p-4 bg-green-600/20 border border-green-400/40 rounded-lg max-w-md w-full">
                    <p className="text-sm text-green-200 font-medium text-center">
                      ✓ You're registered for this event!
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Location Details */}
            {event.location && (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-soft p-8">
                <h2 className="text-2xl font-bold text-[#273351] mb-4 flex items-center">
                  <MapPin className="w-6 h-6 mr-3" />
                  Location
                </h2>
                <div className="space-y-2 mb-6">
                  <p className="text-lg font-semibold text-gray-900">{event.location}</p>
                  {event.location_address && (
                    <p className="text-gray-600">{event.location_address}</p>
                  )}
                </div>

                {/* Apple Maps Integration */}
                <EventMap
                  location={event.location}
                  locationAddress={event.location_address}
                  eventTitle={event.title}
                />
              </div>
            )}
          </div>

          {/* Info Cards Row - 2 columns */}
          {event.rsvp_enabled && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Date & Time Card */}
              <div className="bg-[#273351] backdrop-blur-sm rounded-xl shadow-soft p-6">
                <div className="space-y-4 text-sm">
                  <div className="flex items-start space-x-3">
                    <Calendar className="w-5 h-5 text-white mt-0.5" />
                    <div>
                      <div className="font-semibold text-white">Date & Time</div>
                      <div className="text-white/80">{formatEventDate(event.event_date)}</div>
                    </div>
                  </div>

                  {event.rsvp_deadline && (
                    <div className="flex items-start space-x-3">
                      <Clock className="w-5 h-5 text-white mt-0.5" />
                      <div>
                        <div className="font-semibold text-white">RSVP Deadline</div>
                        <div className="text-white/80">
                          {formatEventDate(event.rsvp_deadline)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Share Card - Fully Clickable */}
              <ShareButton title={event.title} asCard={true} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
