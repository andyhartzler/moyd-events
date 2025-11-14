'use client';

import { useState } from 'react';
import { EventCard } from '@/components/events/EventCard';
import { EventCalendar } from '@/components/calendar/EventCalendar';
import { Calendar, List, Plus } from 'lucide-react';
import Link from 'next/link';
import type { EventWithRSVP } from '@/types/database.types';

interface EventsPageClientProps {
  events: EventWithRSVP[];
}

export function EventsPageClient({ events }: EventsPageClientProps) {
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

          {/* View Toggle and Add Event Button */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
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

            <Link
              href="/admin/events/new"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Add New Event
            </Link>
          </div>
        </div>

        {/* Content */}
        {viewMode === 'calendar' ? (
          <EventCalendar events={events} />
        ) : events && events.length > 0 ? (
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
              <p className="text-gray-600 mb-4">Check back soon for new events and opportunities to get involved!</p>
              <Link
                href="/admin/events/new"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create First Event
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
