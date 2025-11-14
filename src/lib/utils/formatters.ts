import { format, formatDistance, isPast, isFuture, isToday, isTomorrow } from 'date-fns';

export function formatEventDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (isToday(d)) {
    return `Today at ${format(d, 'h:mm a')}`;
  }

  if (isTomorrow(d)) {
    return `Tomorrow at ${format(d, 'h:mm a')}`;
  }

  return format(d, 'EEEE, MMMM d, yyyy \'at\' h:mm a');
}

export function formatEventDateShort(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'MMM d, yyyy');
}

export function getEventStatus(eventDate: string): 'upcoming' | 'happening' | 'past' {
  const date = new Date(eventDate);
  const now = new Date();

  if (isPast(date)) return 'past';
  if (isToday(date)) return 'happening';
  return 'upcoming';
}

export function getTimeUntilEvent(eventDate: string): string {
  const date = new Date(eventDate);
  return formatDistance(date, new Date(), { addSuffix: true });
}
