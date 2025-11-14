# MOYD Events Platform - Complete Code Files

This document contains all the essential code files for the events platform. Copy these files into your Next.js project after running the setup script.

## Table of Contents
- [Configuration Files](#configuration-files)
- [Supabase Integration](#supabase-integration)
- [Type Definitions](#type-definitions)
- [Utility Functions](#utility-functions)
- [Hooks](#hooks)
- [UI Components](#ui-components)
- [Event Components](#event-components)
- [Pages - Public](#pages---public)
- [Pages - Auth](#pages---auth)
- [Pages - Admin](#pages---admin)

---

## Configuration Files

### `src/lib/supabase/client.ts`
```typescript
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

### `src/lib/supabase/server.ts`
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}
```

### `src/lib/supabase/middleware.ts`
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  await supabase.auth.getUser();

  return response;
}
```

### `middleware.ts` (root level)
```typescript
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: any) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

---

## Type Definitions

### `src/types/database.types.ts`
```typescript
export interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_end_date: string | null;
  location: string | null;
  location_address: string | null;
  event_type: string | null;
  rsvp_enabled: boolean;
  rsvp_deadline: string | null;
  max_attendees: number | null;
  checkin_enabled: boolean;
  checkin_start_time: string | null;
  checkin_end_time: string | null;
  reminder_sent: boolean;
  reminder_sent_at: string | null;
  checkin_notification_sent: boolean;
  checkin_notification_sent_at: string | null;
  status: 'draft' | 'published' | 'cancelled';
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventRSVP {
  id: string;
  event_id: string;
  member_id: string;
  rsvp_status: 'attending' | 'maybe' | 'not_attending';
  guest_count: number;
  notes: string | null;
  checked_in: boolean;
  checked_in_at: string | null;
  checked_in_by: string | null;
  rsvp_at: string;
  updated_at: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  date_joined: string | null;
}

export interface EventWithRSVP extends Event {
  user_rsvp?: EventRSVP;
  rsvp_count?: number;
}
```

---

## Utility Functions

### `src/lib/utils/cn.ts`
```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### `src/lib/utils/formatters.ts`
```typescript
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
```

---

## Hooks

### `src/lib/hooks/useEvents.ts`
```typescript
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Event, EventWithRSVP } from '@/types/database.types';

interface UseEventsOptions {
  eventType?: string;
  status?: 'upcoming' | 'past' | 'all';
  includeUserRSVP?: boolean;
}

export function useEvents(options: UseEventsOptions = {}) {
  const [events, setEvents] = useState<EventWithRSVP[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchEvents() {
      try {
        let query = supabase
          .from('events')
          .select('*, event_rsvps(count)')
          .eq('status', 'published');

        // Filter by date
        if (options.status === 'upcoming') {
          query = query.gte('event_date', new Date().toISOString());
        } else if (options.status === 'past') {
          query = query.lt('event_date', new Date().toISOString());
        }

        // Filter by type
        if (options.eventType) {
          query = query.eq('event_type', options.eventType);
        }

        query = query.order('event_date', { ascending: options.status !== 'past' });

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;

        // If user wants RSVPs, fetch them separately
        if (options.includeUserRSVP) {
          const { data: { user } } = await supabase.auth.getUser();

          if (user) {
            const eventIds = data?.map(e => e.id) || [];
            const { data: rsvps } = await supabase
              .from('event_rsvps')
              .select('*')
              .eq('member_id', user.id)
              .in('event_id', eventIds);

            const eventsWithRSVP = data?.map(event => ({
              ...event,
              user_rsvp: rsvps?.find(r => r.event_id === event.id),
            })) || [];

            setEvents(eventsWithRSVP);
          } else {
            setEvents(data || []);
          }
        } else {
          setEvents(data || []);
        }

        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();

    // Real-time subscription
    const channel = supabase
      .channel('events-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'events',
      }, () => {
        fetchEvents();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [options.eventType, options.status]);

  return { events, loading, error };
}
```

### `src/lib/hooks/useRSVP.ts`
```typescript
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useRSVP() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const rsvp = async (eventId: string, guestCount: number = 0) => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Please log in to RSVP');

      const { error: rsvpError } = await supabase
        .from('event_rsvps')
        .upsert({
          event_id: eventId,
          member_id: user.id,
          rsvp_status: 'attending',
          guest_count: guestCount,
        });

      if (rsvpError) throw rsvpError;

      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const cancelRSVP = async (eventId: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error: deleteError } = await supabase
        .from('event_rsvps')
        .delete()
        .eq('event_id', eventId)
        .eq('member_id', user.id);

      if (deleteError) throw deleteError;

      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { rsvp, cancelRSVP, loading, error };
}
```

---

## UI Components

### `src/components/ui/Button.tsx`
```typescript
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:pointer-events-none',
          {
            'bg-[#273351] text-white hover:bg-[#1a2338]': variant === 'default',
            'border border-gray-300 bg-white hover:bg-gray-50': variant === 'outline',
            'hover:bg-gray-100': variant === 'ghost',
            'bg-red-600 text-white hover:bg-red-700': variant === 'destructive',
          },
          {
            'h-10 py-2 px-4': size === 'default',
            'h-9 px-3 text-sm': size === 'sm',
            'h-11 px-8': size === 'lg',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button };
```

### `src/components/ui/Card.tsx`
```typescript
import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-lg border bg-white shadow-sm',
        className
      )}
      {...props}
    />
  )
);
Card.displayName = 'Card';

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 p-6', className)}
      {...props}
    />
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-2xl font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

export { Card, CardHeader, CardTitle, CardContent };
```

---

## Event Components

### `src/components/events/EventCard.tsx`
```typescript
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
```

### `src/components/events/RSVPButton.tsx`
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useRSVP } from '@/lib/hooks/useRSVP';
import { createClient } from '@/lib/supabase/client';

interface RSVPButtonProps {
  eventId: string;
  hasRSVPd: boolean;
}

export function RSVPButton({ eventId, hasRSVPd: initialRSVP }: RSVPButtonProps) {
  const [hasRSVPd, setHasRSVPd] = useState(initialRSVP);
  const { rsvp, cancelRSVP, loading, error } = useRSVP();
  const router = useRouter();
  const supabase = createClient();

  const handleRSVP = async () => {
    // Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // Redirect to login
      router.push(`/login?redirect=/events/${eventId}`);
      return;
    }

    if (hasRSVPd) {
      const success = await cancelRSVP(eventId);
      if (success) {
        setHasRSVPd(false);
        router.refresh();
      }
    } else {
      const success = await rsvp(eventId);
      if (success) {
        setHasRSVPd(true);
        router.refresh();
      }
    }
  };

  return (
    <div>
      <Button
        onClick={handleRSVP}
        disabled={loading}
        variant={hasRSVPd ? 'outline' : 'default'}
        size="lg"
      >
        {loading ? 'Loading...' : hasRSVPd ? 'Cancel RSVP' : 'RSVP Now'}
      </Button>
      {error && (
        <p className="text-sm text-red-600 mt-2">{error}</p>
      )}
    </div>
  );
}
```

### `src/components/events/QRScanner.tsx`
```typescript
'use client';

import { useState } from 'react';
import { QrScanner } from '@yudiel/react-qr-scanner';
import { createClient } from '@/lib/supabase/client';
import { CheckCircle, XCircle } from 'lucide-react';

interface QRScannerProps {
  eventId: string;
}

interface ScanResult {
  success: boolean;
  memberName?: string;
  message: string;
}

export function EventQRScanner({ eventId }: QRScannerProps) {
  const [scanning, setScanning] = useState(true);
  const [result, setResult] = useState<ScanResult | null>(null);
  const supabase = createClient();

  const handleScan = async (scannedData: string) => {
    if (!scannedData) return;

    setScanning(false);

    try {
      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(scannedData)) {
        throw new Error('Invalid QR code format');
      }

      const memberId = scannedData;

      // Get RSVP with member info
      const { data: rsvp, error: rsvpError } = await supabase
        .from('event_rsvps')
        .select(`
          *,
          members!inner(
            id,
            name,
            email
          )
        `)
        .eq('event_id', eventId)
        .eq('member_id', memberId)
        .single();

      if (rsvpError || !rsvp) {
        throw new Error('Member has not RSVPd to this event');
      }

      if (rsvp.checked_in) {
        throw new Error(`${rsvp.members.name} already checked in`);
      }

      // Mark as checked in
      const { error: updateError } = await supabase
        .from('event_rsvps')
        .update({
          checked_in: true,
          checked_in_at: new Date().toISOString(),
          checked_in_by: 'qr_code',
        })
        .eq('id', rsvp.id);

      if (updateError) throw updateError;

      setResult({
        success: true,
        memberName: rsvp.members.name,
        message: 'Successfully checked in!',
      });

      // Reset after 2 seconds
      setTimeout(() => {
        setScanning(true);
        setResult(null);
      }, 2000);

    } catch (err: any) {
      setResult({
        success: false,
        message: err.message || 'Failed to check in',
      });

      // Reset after 3 seconds
      setTimeout(() => {
        setScanning(true);
        setResult(null);
      }, 3000);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative aspect-square max-w-md mx-auto bg-black rounded-lg overflow-hidden">
        {scanning && !result ? (
          <QrScanner
            onDecode={handleScan}
            onError={(error) => console.error(error)}
          />
        ) : result ? (
          <div className={`absolute inset-0 flex flex-col items-center justify-center ${
            result.success ? 'bg-green-500' : 'bg-red-500'
          } text-white`}>
            {result.success ? (
              <CheckCircle className="w-16 h-16 mb-4" />
            ) : (
              <XCircle className="w-16 h-16 mb-4" />
            )}
            {result.memberName && (
              <div className="text-2xl font-bold mb-2">{result.memberName}</div>
            )}
            <div className="text-xl">{result.message}</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
```

---

## Pages - Public

### `src/app/(public)/page.tsx`
```typescript
import { createClient } from '@/lib/supabase/server';
import { EventCard } from '@/components/events/EventCard';

export default async function HomePage() {
  const supabase = createClient();

  const { data: events } = await supabase
    .from('events')
    .select('*, event_rsvps(count)')
    .eq('status', 'published')
    .gte('event_date', new Date().toISOString())
    .order('event_date', { ascending: true })
    .limit(6);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[#273351] mb-4">
          Missouri Young Democrats Events
        </h1>
        <p className="text-xl text-gray-600">
          Join us in building a better Missouri
        </p>
      </div>

      {events && events.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600">No upcoming events at this time.</p>
        </div>
      )}
    </div>
  );
}
```

### `src/app/(public)/events/[id]/page.tsx`
```typescript
import { notFound } from 'next/navigation';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { RSVPButton } from '@/components/events/RSVPButton';
import { formatEventDate } from '@/lib/utils/formatters';

export default async function EventDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!event) notFound();

  // Check if user has RSVPd
  const { data: { user } } = await supabase.auth.getUser();
  let hasRSVPd = false;

  if (user) {
    const { data: rsvp } = await supabase
      .from('event_rsvps')
      .select('id')
      .eq('event_id', params.id)
      .eq('member_id', user.id)
      .single();

    hasRSVPd = !!rsvp;
  }

  // Get RSVP count
  const { count } = await supabase
    .from('event_rsvps')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', params.id)
    .eq('rsvp_status', 'attending');

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-[#273351] text-white p-8">
          <h1 className="text-4xl font-bold mb-4">{event.title}</h1>
          <div className="flex items-center text-white/90">
            <Calendar className="w-5 h-5 mr-2" />
            <span>{formatEventDate(event.event_date)}</span>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {event.location && (
            <div className="flex items-start">
              <MapPin className="w-5 h-5 mr-3 mt-1 text-gray-600" />
              <div>
                <div className="font-semibold">Location</div>
                <div className="text-gray-600">{event.location}</div>
                {event.location_address && (
                  <div className="text-sm text-gray-500">{event.location_address}</div>
                )}
              </div>
            </div>
          )}

          {count !== null && (
            <div className="flex items-center">
              <Users className="w-5 h-5 mr-3 text-gray-600" />
              <div>
                <span className="font-semibold">{count} RSVPs</span>
                {event.max_attendees && (
                  <span className="text-gray-600"> / {event.max_attendees} max</span>
                )}
              </div>
            </div>
          )}

          {event.description && (
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap">{event.description}</div>
            </div>
          )}

          {event.rsvp_enabled && (
            <div className="pt-6 border-t">
              <RSVPButton eventId={event.id} hasRSVPd={hasRSVPd} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## Pages - Admin

### `src/app/(admin)/admin/events/[id]/checkin/page.tsx`
```typescript
import { createClient } from '@/lib/supabase/server';
import { EventQRScanner } from '@/components/events/QRScanner';
import { notFound } from 'next/navigation';

export default async function CheckInPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!event) notFound();

  const { data: rsvps, count } = await supabase
    .from('event_rsvps')
    .select(`
      *,
      members!inner(
        id,
        name,
        email
      )
    `, { count: 'exact' })
    .eq('event_id', params.id)
    .eq('rsvp_status', 'attending');

  const checkedInCount = rsvps?.filter(r => r.checked_in).length || 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
        <div className="flex gap-6 text-lg">
          <div>
            <span className="font-semibold">RSVPs:</span>{' '}
            <span className="text-2xl">{count}</span>
          </div>
          <div>
            <span className="font-semibold">Checked In:</span>{' '}
            <span className="text-2xl text-green-600">{checkedInCount}</span>
          </div>
          <div>
            <span className="font-semibold">Rate:</span>{' '}
            <span className="text-2xl">
              {count ? Math.round((checkedInCount / count) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Scan QR Code</h2>
          <EventQRScanner eventId={params.id} />
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">
            Attendees ({checkedInCount}/{count})
          </h2>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {rsvps?.map((rsvp) => (
              <div
                key={rsvp.id}
                className={`p-3 rounded-lg border ${
                  rsvp.checked_in
                    ? 'bg-green-50 border-green-200'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{rsvp.members.name}</div>
                    <div className="text-sm text-gray-600">{rsvp.members.email}</div>
                  </div>
                  {rsvp.checked_in && (
                    <div className="text-green-600 font-semibold">✓ Checked In</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## Layout Files

### `src/app/layout.tsx`
```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MOYD Events',
  description: 'Missouri Young Democrats Events Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="bg-[#273351] text-white">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <a href="/" className="text-xl font-bold">
                MOYD Events
              </a>
              <div className="flex gap-6">
                <a href="/" className="hover:underline">Events</a>
                <a href="/my-events" className="hover:underline">My Events</a>
                <a href="/admin/events" className="hover:underline">Admin</a>
              </div>
            </div>
          </div>
        </nav>
        <main>{children}</main>
        <footer className="bg-gray-100 mt-12">
          <div className="container mx-auto px-4 py-8 text-center text-gray-600">
            <p>© 2025 Missouri Young Democrats. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
```

---

## Next Steps

1. Run the setup script: `bash events-platform-setup.sh`
2. Copy these code files into your Next.js project
3. Update `.env.local` with your Supabase credentials
4. Run: `npm run dev`
5. Test locally at http://localhost:3000
6. Deploy to Vercel
7. Configure custom domain

**Ready to deploy!** 🚀
