import Link from 'next/link';
import { Calendar, MapPin, ArrowRight, Clock } from 'lucide-react';
import { formatEventDate, getEventStatus } from '@/lib/utils/formatters';
import { generateEventSlug } from '@/lib/utils/slugify';
import type { EventWithRSVP } from '@/types/database.types';

interface EventCardProps {
  event: EventWithRSVP;
}

export function EventCard({ event }: EventCardProps) {
  const status = getEventStatus(event.event_date);
  const eventSlug = generateEventSlug(event.title, event.event_date);

  const getEventTypeColor = (type: string | null) => {
    switch (type) {
      case 'meeting':
        return 'bg-blue-100 text-blue-800';
      case 'rally':
        return 'bg-red-100 text-red-800';
      case 'fundraiser':
        return 'bg-green-100 text-green-800';
      case 'social':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Link href={`/events/${eventSlug}`} className="group">
      <div className="card-elevated h-full flex flex-col overflow-hidden transform transition-all duration-300 hover:-translate-y-1">
        {/* Header with gradient */}
        <div className="gradient-primary p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-3">
              {event.event_type && (
                <span className="text-xs bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full font-semibold uppercase tracking-wide">
                  {event.event_type}
                </span>
              )}
              {event.user_attendee && (
                <span className="text-xs bg-green-500 text-white px-3 py-1 rounded-full font-semibold flex items-center">
                  <span className="w-2 h-2 bg-white rounded-full mr-1.5"></span>
                  RSVPd
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold leading-tight group-hover:text-primary-50 transition-colors">
              {event.title}
            </h3>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex-grow space-y-4">
          <div className="flex items-start space-x-3 text-gray-700">
            <Calendar className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium text-sm">{formatEventDate(event.event_date)}</div>
            </div>
          </div>

          {event.location && (
            <div className="flex items-start space-x-3 text-gray-700">
              <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-sm font-medium">{event.location}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <div className="flex items-center justify-between pt-4 border-t">
            {status === 'happening' ? (
              <span className="flex items-center text-sm font-semibold text-red-600">
                <Clock className="w-4 h-4 mr-1.5 animate-pulse" />
                Happening Now
              </span>
            ) : (
              <span className="text-sm text-gray-500">View Details</span>
            )}
            <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
}
