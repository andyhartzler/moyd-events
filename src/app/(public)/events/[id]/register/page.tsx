import { createClient } from '@/lib/supabase/server';
import { PhoneLookupForm } from '@/components/events/PhoneLookupForm';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin } from 'lucide-react';
import { formatEventDate } from '@/lib/utils/formatters';
import { parseEventSlug, generateEventSlug } from '@/lib/utils/slugify';

export default async function PublicRegisterPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { phone?: string };
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

  // Generate the slug for consistent URLs
  const eventSlug = generateEventSlug(event.title, event.event_date);

  return (
    <div className="min-h-screen py-12">
      <div className="container-custom max-w-2xl">
        <Link
          href={`/events/${eventSlug}`}
          className="inline-flex items-center text-white hover:opacity-70 font-medium transition-opacity mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Event
        </Link>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 mb-6 shadow-lg">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {event.title}
          </h1>
          <div className="flex flex-wrap gap-4 text-gray-600">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              {formatEventDate(event.event_date)}
            </div>
            {event.location && (
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                {event.location}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
          <PhoneLookupForm
            eventId={event.id}
            eventName={event.title}
            eventType={event.event_type}
            youngDemsOnly={event.young_dems_only ?? false}
            prefilledPhone={searchParams.phone}
          />
        </div>
      </div>
    </div>
  );
}
