'use client';

import { useState } from 'react';
import { EventCard } from '@/components/events/EventCard';
import { EventCalendar } from '@/components/calendar/EventCalendar';
import { MobileEventCalendar } from '@/components/calendar/MobileEventCalendar';
import { SubscribeButton } from '@/components/events/SubscribeButton';
import Link from 'next/link';
import { Calendar, List } from 'lucide-react';
import type { EventWithRSVP } from '@/types/database.types';

interface EventsPageClientProps {
  upcomingEvents: EventWithRSVP[];
  pastEvents: EventWithRSVP[];
  allEvents: EventWithRSVP[];
}

export function EventsPageClient({ upcomingEvents, pastEvents, allEvents }: EventsPageClientProps) {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  return (
    <div className="py-12">
      <div className="container-custom">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Upcoming Events
          </h1>
          <p className="text-xl text-white max-w-2xl mx-auto mb-6">
            Join us at our upcoming events and be part of the change you want to see in Missouri.
          </p>

          {/* View Toggle */}
          <div className="flex items-center justify-center">
            <div className="inline-flex bg-white/20 backdrop-blur-sm rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-gray-900 shadow-md'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <List className="w-4 h-4" />
                List View
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  viewMode === 'calendar'
                    ? 'bg-white text-gray-900 shadow-md'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <Calendar className="w-4 h-4" />
                Calendar View
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {viewMode === 'calendar' ? (
          <>
            {/* Desktop Calendar */}
            <div className="hidden md:block">
              <EventCalendar events={allEvents} />
            </div>
            {/* Mobile Calendar */}
            <div className="md:hidden">
              <MobileEventCalendar events={allEvents} />
            </div>
          </>
        ) : (
          <>
            {/* Upcoming Events */}
            {upcomingEvents && upcomingEvents.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {upcomingEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-8 max-w-md mx-auto">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">No Upcoming Events</h3>
                  <SubscribeButton />
                </div>
              </div>
            )}

            {/* Subscribe Button - Always show at bottom when there are upcoming events */}
            {upcomingEvents && upcomingEvents.length > 0 && (
              <div className="mt-12 max-w-md mx-auto">
                <SubscribeButton />
              </div>
            )}

            {/* Past Events Section */}
            {pastEvents && pastEvents.length > 0 && (
              <div className="mt-16">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
                  Past Events
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {pastEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </div>
            )}

            {/* Create Event CTA */}
            <div className="mt-16 max-w-4xl mx-auto">
              <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-8 text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Create an Event</h3>
                <p className="text-gray-700 mb-6">
                  Have an event to share? Submit the details below and we&rsquo;ll save it as a draft on the
                  events page.
                </p>
                <Link
                  href="/events/create"
                  className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition-all shadow-md"
                >
                  Start Event Form
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
