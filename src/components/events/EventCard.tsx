import Link from 'next/link';
import { Calendar, MapPin, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatEventDate, getEventStatus } from '@/lib/utils/formatters';
import type { EventWithRSVP } from '@/types/database.types';

interface EventCardProps {
  event: EventWithRSVP;
}

export function EventCard({ event }: EventCardProps) {
  const status = getEventStatus(event.event_date);

  return (
    <Link href={`/events/${event.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-xl">{event.title}</CardTitle>
            {event.user_rsvp && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                RSVPd
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            <span className="text-sm">{formatEventDate(event.event_date)}</span>
          </div>

          {event.location && (
            <div className="flex items-center text-gray-600">
              <MapPin className="w-4 h-4 mr-2" />
              <span className="text-sm">{event.location}</span>
            </div>
          )}

          {event.rsvp_count !== undefined && (
            <div className="flex items-center text-gray-600">
              <Users className="w-4 h-4 mr-2" />
              <span className="text-sm">{event.rsvp_count} RSVPs</span>
            </div>
          )}

          {event.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mt-2">
              {event.description}
            </p>
          )}

          {status === 'happening' && (
            <div className="mt-2">
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                Happening Now
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
