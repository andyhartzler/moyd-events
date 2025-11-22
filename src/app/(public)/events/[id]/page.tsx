import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Calendar, MapPin, Clock, ArrowLeft, Share2, Info } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { RSVPButton } from '@/components/events/RSVPButton';
import { SubscribeButton } from '@/components/events/SubscribeButton';
import { EventMap } from '@/components/events/EventMap';
import { formatEventDate } from '@/lib/utils/formatters';
import { parseEventSlug } from '@/lib/utils/slugify';
import { Event } from '@/types/database.types';

// Helper function to get Supabase storage URL for an image
function getStorageImageUrl(image: Event['website_image'] | Event['social_share_image']): string | null {
  if (!image) return null;
  return image.storage_url || null;
}

// Helper to fetch event by slug or ID
async function getEventBySlugOrId(id: string) {
  const supabase = createClient();
  const slugData = parseEventSlug(id);

  if (slugData) {
    const { data: events } = await supabase
      .from('events')
      .select('*')
      .gte('event_date', slugData.dateStart)
      .lte('event_date', slugData.dateEnd)
      .ilike('title', `%${slugData.titlePattern}%`)
      .eq('status', 'published')
      .limit(1)
      .single();
    return events;
  }

  const { data } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();
  return data;
}

// Generate dynamic metadata for social sharing
export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const event = await getEventBySlugOrId(params.id) as Event | null;

  if (!event) {
    return {
      title: 'Event Not Found - Missouri Young Democrats',
    };
  }

  const socialShareImageUrl = getStorageImageUrl(event.social_share_image);
  const defaultShareImage = '/social-share-image.png';
  const shareImage = socialShareImageUrl || defaultShareImage;

  return {
    title: `${event.title} - Missouri Young Democrats`,
    description: event.description || `Join us at ${event.title}! Connect, organize, and make a difference in our community.`,
    openGraph: {
      title: event.title,
      description: event.description || `Join us at ${event.title}!`,
      images: [
        {
          url: shareImage,
          width: 1200,
          height: 630,
          alt: event.title,
        },
      ],
      type: 'website',
      siteName: 'Missouri Young Democrats',
    },
    twitter: {
      card: 'summary_large_image',
      title: event.title,
      description: event.description || `Join us at ${event.title}!`,
      images: [shareImage],
    },
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const event = await getEventBySlugOrId(params.id) as Event | null;

  if (!event) notFound();

  // Get website image URL if available
  const websiteImageUrl = getStorageImageUrl(event.website_image);

  // Check if event is past (more than 2 hours after event date)
  const eventDateTime = new Date(event.event_date);
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
  const isEventPast = eventDateTime < twoHoursAgo;

  // Check if user has RSVPd
  const { data: { user } } = await supabase.auth.getUser();
  let hasRSVPd = false;

  if (user) {
    const { data: rsvp } = await supabase
      .from('event_attendees')
      .select('id')
      .eq('event_id', event.id)
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

          {/* Two Column Layout: Info Tiles on Left, Poster Image on Right (Mobile: Stacked) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 lg:items-start">
            {/* Left Column - Stacked tiles */}
            <div className="flex flex-col gap-4 lg:col-start-1">
              {/* RSVP Button for upcoming events, Subscribe for past events */}
              {isEventPast ? (
                <SubscribeButton />
              ) : (
                event.rsvp_enabled && (
                  <div>
                    <RSVPButton eventId={event.id} hasRSVPd={hasRSVPd} eventDate={event.event_date} />
                    {hasRSVPd && (
                      <div className="p-4 bg-green-600/20 border border-green-400/40 rounded-lg mt-4">
                        <p className="text-sm text-green-200 font-medium text-center">
                          ✓ You're registered for this event!
                        </p>
                      </div>
                    )}
                  </div>
                )
              )}

              {/* About This Event */}
              {event.description && (
                <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-soft p-5">
                  <h2 className="text-xl font-bold text-[#273351] mb-3 flex items-center">
                    <Info className="w-5 h-5 mr-2" />
                    About This Event
                  </h2>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">
                      {event.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Location Map - Now on left side */}
              {event.location && (
                <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-soft p-5">
                  <h2 className="text-xl font-bold text-[#273351] mb-3 flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Location
                  </h2>
                  <div className="space-y-1 mb-4">
                    <p className="text-base font-semibold text-gray-900">{event.location}</p>
                    {event.location_address && (
                      <a
                        href={`https://maps.apple.com/?address=${encodeURIComponent(event.location_address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-600 underline hover:text-[#273351] transition-colors"
                      >
                        {event.location_address}
                      </a>
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

            {/* Right Column - Event Poster Image */}
            {websiteImageUrl && (
              <div className="lg:col-start-2 lg:row-start-1">
                <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-soft p-3">
                  <img
                    src={websiteImageUrl}
                    alt={`${event.title} event poster`}
                    className="w-full h-auto rounded-lg shadow-md object-contain"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
