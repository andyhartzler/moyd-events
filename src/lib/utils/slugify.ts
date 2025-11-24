import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';

const CENTRAL_TZ = 'America/Chicago';

/**
 * Generate a URL-friendly slug from event title and date
 * Format: event-title-MM-DD-YY (date in Central Time)
 */
export function generateEventSlug(title: string, eventDate: string): string {
  // Clean the title: lowercase, remove special chars, replace spaces with hyphens
  const titleSlug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .replace(/--+/g, '-')       // Replace multiple hyphens with single hyphen
    .trim();

  // Format date as MM-DD-YY in Central Time
  const date = new Date(eventDate);
  const centralDate = formatInTimeZone(date, CENTRAL_TZ, 'MM-dd-yy');

  return `${titleSlug}-${centralDate}`;
}

/**
 * Parse event slug to extract title pattern and date
 * Returns the date in UTC ISO format for database querying
 * The slug date is interpreted as Central Time
 */
export function parseEventSlug(slug: string): { titlePattern: string; dateStart: string; dateEnd: string } | null {
  // Extract date from end of slug (MM-DD-YY format)
  const match = slug.match(/^(.+)-(\d{2})-(\d{2})-(\d{2})$/);

  if (!match) return null;

  const [, titlePart, month, day, year] = match;

  // Convert 2-digit year to 4-digit (assuming 20XX)
  const fullYear = `20${year}`;

  // Create date range for the entire day in Central Time, then convert to UTC
  // This ensures we match events that fall on this date in Central Time
  const centralDateStart = `${fullYear}-${month}-${day}T00:00:00`;
  const centralDateEnd = `${fullYear}-${month}-${day}T23:59:59`;

  // Convert Central Time range to UTC for database querying
  const utcDateStart = fromZonedTime(centralDateStart, CENTRAL_TZ);
  const utcDateEnd = fromZonedTime(centralDateEnd, CENTRAL_TZ);

  // Convert title slug back to searchable pattern
  const titlePattern = titlePart.replace(/-/g, ' ');

  return {
    titlePattern,
    dateStart: utcDateStart.toISOString(),
    dateEnd: utcDateEnd.toISOString()
  };
}
