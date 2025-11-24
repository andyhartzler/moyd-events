import { format, formatDistance, isPast, isFuture, isToday, isTomorrow } from 'date-fns';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';

const CENTRAL_TZ = 'America/Chicago';

// Helper to convert date to Central Time
function toCentralTime(date: string | Date): Date {
  const d = typeof date === 'string' ? new Date(date) : date;
  return toZonedTime(d, CENTRAL_TZ);
}

export function formatEventDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const centralDate = toCentralTime(d);

  if (isToday(centralDate)) {
    return `Today at ${formatInTimeZone(d, CENTRAL_TZ, 'h:mm a')}`;
  }

  if (isTomorrow(centralDate)) {
    return `Tomorrow at ${formatInTimeZone(d, CENTRAL_TZ, 'h:mm a')}`;
  }

  return formatInTimeZone(d, CENTRAL_TZ, 'EEEE, MMMM d, yyyy \'at\' h:mm a');
}

// Shorter format for preview cards to prevent wrapping
export function formatEventDateCompact(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const centralDate = toCentralTime(d);

  if (isToday(centralDate)) {
    return `Today at ${formatInTimeZone(d, CENTRAL_TZ, 'h:mm a')}`;
  }

  if (isTomorrow(centralDate)) {
    return `Tomorrow at ${formatInTimeZone(d, CENTRAL_TZ, 'h:mm a')}`;
  }

  // Use abbreviated day and month names to prevent wrapping
  return formatInTimeZone(d, CENTRAL_TZ, 'EEE, MMM d, yyyy \'at\' h:mm a');
}

export function formatEventDateShort(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'MMM d, yyyy');
}

export function getEventStatus(eventDate: string): 'upcoming' | 'happening' | 'past' {
  const date = new Date(eventDate);
  const centralDate = toCentralTime(date);
  const now = toCentralTime(new Date());

  if (isPast(centralDate)) return 'past';
  if (isToday(centralDate)) return 'happening';
  return 'upcoming';
}

export function getTimeUntilEvent(eventDate: string): string {
  const date = new Date(eventDate);
  return formatDistance(date, new Date(), { addSuffix: true });
}
