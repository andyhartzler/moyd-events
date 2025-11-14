import { notFound } from 'next/navigation';
import { Calendar, MapPin, Users, Clock, ArrowLeft, Share2, Info } from 'lucide-react';
import Link from 'next/link';
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

  const attendancePercentage = event.max_attendees && count
    ? Math.round((count / event.max_attendees) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b">
        <div className="container-custom py-4">
          <Link
            href="/"
            className="inline-flex items-center text-primary hover:text-primary-700 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section className="gradient-primary text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto">
            {event.event_type && (
              <span className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide mb-4">
                {event.event_type}
              </span>
            )}
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              {event.title}
            </h1>
            <div className="flex flex-wrap gap-6 text-lg">
              <div className="flex items-center">
                <Calendar className="w-6 h-6 mr-3" />
                <span>{formatEventDate(event.event_date)}</span>
              </div>
              {event.location && (
                <div className="flex items-center">
                  <MapPin className="w-6 h-6 mr-3" />
                  <span>{event.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container-custom py-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              {event.description && (
                <div className="bg-white rounded-xl shadow-soft p-8">
                  <h2 className="text-2xl font-bold text-primary mb-4 flex items-center">
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
                <div className="bg-white rounded-xl shadow-soft p-8">
                  <h2 className="text-2xl font-bold text-primary mb-4 flex items-center">
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

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* RSVP Card */}
                {event.rsvp_enabled && (
                  <div className="bg-white rounded-xl shadow-medium p-6 border-2 border-primary-100">
                    <h3 className="text-xl font-bold text-primary mb-4">RSVP for Event</h3>

                    {/* Attendance Stats */}
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Users className="w-5 h-5 text-primary" />
                          <span className="font-semibold text-gray-700">Attending</span>
                        </div>
                        <span className="text-2xl font-bold text-primary">{count || 0}</span>
                      </div>

                      {event.max_attendees && (
                        <>
                          <div className="text-sm text-gray-600">
                            {event.max_attendees - (count || 0)} spots remaining
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${attendancePercentage}%` }}
                            ></div>
                          </div>
                        </>
                      )}
                    </div>

                    <RSVPButton eventId={event.id} hasRSVPd={hasRSVPd} />

                    {hasRSVPd && (
                      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800 font-medium">
                          ✓ You're registered for this event!
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Event Details Card */}
                <div className="bg-white rounded-xl shadow-soft p-6">
                  <h3 className="text-lg font-bold text-primary mb-4">Event Details</h3>
                  <div className="space-y-4 text-sm">
                    <div className="flex items-start space-x-3">
                      <Calendar className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <div className="font-semibold text-gray-700">Date & Time</div>
                        <div className="text-gray-600">{formatEventDate(event.event_date)}</div>
                      </div>
                    </div>

                    {event.rsvp_deadline && (
                      <div className="flex items-start space-x-3">
                        <Clock className="w-5 h-5 text-primary mt-0.5" />
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
                <div className="bg-primary-50 rounded-xl p-6 text-center">
                  <Share2 className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h3 className="font-bold text-primary mb-2">Share This Event</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Help spread the word about this event
                  </p>
                  <button className="text-primary hover:text-primary-700 font-semibold text-sm">
                    Share on Social Media
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
