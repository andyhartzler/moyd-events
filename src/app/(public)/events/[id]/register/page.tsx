import { createClient } from '@/lib/supabase/server';
import { PublicRegistrationForm } from '@/components/events/PublicRegistrationForm';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin } from 'lucide-react';
import { formatEventDate } from '@/lib/utils/formatters';

export default async function PublicRegisterPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { phone?: string };
}) {
  const supabase = createClient();

  // Fetch event details
  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!event) notFound();

  return (
    <div className="min-h-screen py-12">
      <div className="container-custom max-w-2xl">
        <Link
          href={`/events/${event.id}`}
          className="inline-flex items-center text-[#273351] hover:opacity-70 font-medium transition-opacity mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Event
        </Link>

        {/* Event Header */}
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

        {/* Registration Form */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Register for Event
            </h2>
            <p className="text-gray-600">
              Fill out the form below to register for this event. All fields marked with * are required.
            </p>
          </div>

          <PublicRegistrationForm
            eventId={event.id}
            eventName={event.title}
            prefilledPhone={searchParams.phone}
          />
        </div>
      </div>
    </div>
  );
}
