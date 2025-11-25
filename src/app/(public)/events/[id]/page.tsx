import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { Calendar, MapPin, Clock, ArrowLeft, Share2, Info } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { RSVPButton } from '@/components/events/RSVPButton';
import { SubscribeButton } from '@/components/events/SubscribeButton';
import { LocationMapCard } from '@/components/events/LocationMapCard';
import { MultiLocationMaps } from '@/components/events/MultiLocationMaps';
import { formatEventDate } from '@/lib/utils/formatters';
import { parseEventSlug } from '@/lib/utils/slugify';
import { Event } from '@/types/database.types';

// Helper function to get Supabase storage URL for an image
// If multiple images, returns the first one
function getStorageImageUrl(image: Event['website_image'] | Event['social_share_image']): string | null {
  if (!image) return null;

  // Handle array of images - return first image
  if (Array.isArray(image)) {
    if (image.length === 0) return null;
    const firstImage = image[0];
    return firstImage.url || firstImage.storage_url || null;
  }

  // Handle single image - support both new and legacy field names
  return image.url || image.storage_url || null;
}

// Helper to get all populated locations for multi-location events
interface LocationInfo {
  name: string;
  address: string | null;
}

function getPopulatedLocations(event: Event): LocationInfo[] {
  const locations: LocationInfo[] = [];

  if (event.location_one_name) {
    locations.push({
      name: event.location_one_name,
      address: event.location_one_address,
    });
  }
  if (event.location_two_name) {
    locations.push({
      name: event.location_two_name,
      address: event.location_two_address,
    });
  }
  if (event.location_three_name) {
    locations.push({
      name: event.location_three_name,
      address: event.location_three_address,
    });
  }

  return locations;
}

function buildRSVPMatchingFilters(user: User | null) {
  if (!user) return '';

  const filters = [
    `member_id.eq.${user.id}`,
    user.email ? `guest_email.eq.${user.email}` : '',
    user.phone ? `guest_phone.eq.${user.phone}` : '',
  ];

  return filters.filter(Boolean).join(',');
}

// Helper to fetch event by slug or ID
async function getEventBySlugOrId(id: string) {
  const supabase = createClient();
  const slugData = parseEventSlug(id);

  if (slugData) {
    // First try: match by date range and title pattern
    const { data: events } = await supabase
      .from('events')
      .select('*')
      .gte('event_date', slugData.dateStart)
      .lte('event_date', slugData.dateEnd)
      .ilike('title', `%${slugData.titlePattern}%`)
      .eq('status', 'published')
      .limit(1)
      .single();

    if (events) return events;

    // Second try: match by date range and first few words of title
    // This handles cases where special characters (like &) were removed from slug
    const titleWords = slugData.titlePattern.split(' ').filter(w => w.length > 2);
    if (titleWords.length >= 2) {
      const firstWords = titleWords.slice(0, 2).join('%');
      const { data: eventsPartial } = await supabase
        .from('events')
        .select('*')
        .gte('event_date', slugData.dateStart)
        .lte('event_date', slugData.dateEnd)
        .ilike('title', `%${firstWords}%`)
        .eq('status', 'published')
        .limit(1)
        .single();

      if (eventsPartial) return eventsPartial;
    }

    // Third try: just match by date (fallback for single event days)
    const { data: eventsByDate } = await supabase
      .from('events')
      .select('*')
      .gte('event_date', slugData.dateStart)
      .lte('event_date', slugData.dateEnd)
      .eq('status', 'published')
      .limit(1)
      .single();

    return eventsByDate;
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

  // Check if user has RSVPd (via auth OR cookie for guest RSVPs)
  const { data: { user } } = await supabase.auth.getUser();
  let hasRSVPd = false;

  // Check authenticated user's RSVP status first so canceled RSVPs don't get overridden by cookies
  if (user) {
    const rsvpFilters = buildRSVPMatchingFilters(user);

    if (rsvpFilters) {
      const { data: rsvp } = await supabase
        .from('event_attendees')
        .select('id, rsvp_status')
        .eq('event_id', event.id)
        .or(rsvpFilters)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      hasRSVPd = rsvp?.rsvp_status === 'attending';
    }
  }

  // Check for RSVP cookie (set when guest registers) only if the user is not authenticated
  // This prevents canceled RSVPs tied to an authenticated account (including phone-based) from
  // being overridden by a stale cookie value.
  if (!hasRSVPd && !user) {
    const cookieStore = cookies();
    const rsvpCookie = cookieStore.get(`rsvp_${event.id}`);
    if (rsvpCookie?.value === 'true') {
      hasRSVPd = true;
    }
  }

  // Get attendee count from the event record (updated automatically by trigger)
  const count = event.attendee_count || 0;

  const attendancePercentage = event.max_attendees && count
    ? Math.round((count / event.max_attendees) * 100)
    : 0;

  // Check if address should be hidden (hide_address_before_rsvp is true AND user hasn't RSVPd)
  const shouldHideAddress = Boolean(event.hide_address_before_rsvp && !hasRSVPd);

  // Get locations for multi-location events
  const isMultiLocation = event.multiple_locations === true;
  const multiLocations = isMultiLocation ? getPopulatedLocations(event) : [];
  const hasMultiLocations = isMultiLocation && multiLocations.length > 0;
  const displayLocation = hasMultiLocations
    ? event.location || multiLocations[0].name
    : event.location;

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
              {displayLocation && (
                <div className="flex items-center">
                  <MapPin className="w-6 h-6 mr-2 text-white" />
                  <span>{displayLocation}</span>
                </div>
              )}
            </div>
          </div>

          {/* Two Column Layout: Info Tiles on Left, Poster Image on Right (Mobile: Stacked) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 lg:items-stretch">
            {/* Left Column - Stacked tiles */}
            <div className="flex flex-col gap-4 lg:col-start-1">
              {/* RSVP Button for upcoming events, Subscribe for past events */}
              {isEventPast ? (
                <div id="subscribe-form">
                  <SubscribeButton />
                </div>
              ) : (
                event.rsvp_enabled && (
                  <div>
                    <RSVPButton eventId={event.id} hasRSVPd={hasRSVPd} eventDate={event.event_date} />
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

              {/* Location Map(s) - Handle single or multiple locations */}
              {hasMultiLocations ? (
                <MultiLocationMaps
                  locations={multiLocations}
                  shouldHideAddress={shouldHideAddress}
                  eventTitle={event.title}
                  eventSlug={params.id}
                  isEventPast={isEventPast}
                />
              ) : (
                /* Single Location - grows to fill remaining column height */
                displayLocation && (
                  <LocationMapCard
                    displayLocation={displayLocation}
                    eventTitle={event.title}
                    locationAddress={event.location_address}
                    shouldHideAddress={shouldHideAddress}
                    isEventPast={isEventPast}
                    eventSlug={params.id}
                    isMultiLocation={isMultiLocation}
                  />
                )
              )}
            </div>

            {/* Right Column - Event Poster Image */}
            {websiteImageUrl && (
              <div className="lg:col-start-2 lg:row-start-1" id="event-poster-card">
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
