/**
 * Generate a URL-friendly slug from event title and date
 * Format: event-title-MM-DD-YY
 */
export function generateEventSlug(title: string, eventDate: string): string {
  // Clean the title: lowercase, remove special chars, replace spaces with hyphens
  const titleSlug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .replace(/--+/g, '-')       // Replace multiple hyphens with single hyphen
    .trim();

  // Format date as MM-DD-YY
  const date = new Date(eventDate);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);

  return `${titleSlug}-${month}-${day}-${year}`;
}

/**
 * Parse event slug to extract title pattern and date
 * Returns the date in ISO format for database querying
 */
export function parseEventSlug(slug: string): { titlePattern: string; dateStart: string; dateEnd: string } | null {
  // Extract date from end of slug (MM-DD-YY format)
  const match = slug.match(/^(.+)-(\d{2})-(\d{2})-(\d{2})$/);

  if (!match) return null;

  const [, titlePart, month, day, year] = match;

  // Convert 2-digit year to 4-digit (assuming 20XX)
  const fullYear = `20${year}`;

  // Create date range for the entire day
  const dateStart = `${fullYear}-${month}-${day}T00:00:00`;
  const dateEnd = `${fullYear}-${month}-${day}T23:59:59`;

  // Convert title slug back to searchable pattern
  const titlePattern = titlePart.replace(/-/g, ' ');

  return { titlePattern, dateStart, dateEnd };
}
