/**
 * Returns the appropriate MapKit token based on the current hostname
 */
export function getMapKitToken(): string {
  if (typeof window === 'undefined') return '';

  const hostname = window.location.hostname;

  // Check for subdomains of moyoungdemocrats.org (but not the root domain)
  if (hostname.endsWith('.moyoungdemocrats.org') && hostname !== 'moyoungdemocrats.org') {
    return process.env.NEXT_PUBLIC_MAPKIT_TOKEN_MOYD_ORG_WILDCARD || '';
  }

  // Check for root domain
  if (hostname === 'moyoungdemocrats.org') {
    return process.env.NEXT_PUBLIC_MAPKIT_TOKEN_MOYD_ORG || '';
  }

  // Check for Vercel preview/production domains
  if (hostname.includes('vercel.app')) {
    return process.env.NEXT_PUBLIC_MAPKIT_TOKEN_VERCEL || '';
  }

  // Fallback to Vercel token for localhost
  return process.env.NEXT_PUBLIC_MAPKIT_TOKEN_VERCEL || '';
}
