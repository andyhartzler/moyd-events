# MOYD Events Platform

**URL**: https://events.moyoungdemocrats.org

A custom-coded events platform integrated with MOYD's Supabase backend, Apple/Google Wallet system, and membership CRM.

## Table of Contents

- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Database Schema](#database-schema)
- [Setup & Deployment](#setup--deployment)
- [User Flows](#user-flows)
- [API Integration](#api-integration)
- [QR Code Check-In System](#qr-code-check-in-system)

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  events.moyoungdemocrats.org            │
│                    (Next.js 14 App)                     │
│                   Deployed on Vercel                     │
└─────────────────────────────────────────────────────────┘
                            │
                            │ API Calls
                            ▼
┌─────────────────────────────────────────────────────────┐
│                   Supabase Backend                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Database   │  │ Edge Functions│  │    Auth      │  │
│  │   Postgres   │  │   Deno/TS    │  │   Users      │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
                            │
            ┌───────────────┼───────────────┐
            │               │               │
            ▼               ▼               ▼
    ┌──────────────┐  ┌──────────┐  ┌──────────────┐
    │ Apple Wallet │  │  Google  │  │  Member CRM  │
    │     Pass     │  │  Wallet  │  │   (Flutter)  │
    │  QR Codes    │  │   Pass   │  │              │
    └──────────────┘  └──────────┘  └──────────────┘
```

---

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **QR Scanner**: @yudiel/react-qr-scanner
- **State Management**: React Context + Supabase Realtime
- **Deployment**: Vercel

### Backend
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime Subscriptions
- **Edge Functions**: Deno/TypeScript

### Key Libraries
```json
{
  "@supabase/supabase-js": "^2.43.0",
  "@supabase/auth-helpers-nextjs": "^0.10.0",
  "@yudiel/react-qr-scanner": "^2.0.0",
  "date-fns": "^3.0.0",
  "lucide-react": "^0.400.0",
  "tailwindcss": "^3.4.0"
}
```

---

## Features

### Public Features
✅ **Event Listing**
- Browse all published events
- Filter by date, location, type
- Search by keyword
- Upcoming events highlighted

✅ **Event Detail Page**
- Full event description
- Date, time, location with map
- RSVP functionality (requires login)
- Share on social media
- Add to calendar (iCal)

✅ **RSVP System**
- One-click RSVP for members
- Guest count support
- Email confirmation
- RSVP management (update/cancel)

✅ **Member Dashboard**
- View all RSVPd events
- Access event QR codes
- Receive event notifications via wallet

### Admin Features
✅ **Event Management**
- Create/edit/delete events
- Set event details (title, description, date, location)
- Enable/disable RSVP
- Set max attendees
- Publish/unpublish events

✅ **Check-In System**
- QR code scanner interface
- Real-time attendance tracking
- Manual check-in option
- View attendance list
- Export attendee data

✅ **Notifications**
- Send wallet notifications to RSVPd members
- Reminder notifications (24h before)
- Check-in open notifications
- Last call notifications

✅ **Analytics**
- RSVP count vs attendance
- Member engagement metrics
- Event popularity tracking

---

## Database Schema

### Tables (Already Created)

#### `events` table
```sql
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Event details
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  event_end_date TIMESTAMP WITH TIME ZONE,
  location TEXT,
  location_address TEXT,
  event_type TEXT, -- 'meeting', 'rally', 'fundraiser', 'social'

  -- RSVP settings
  rsvp_enabled BOOLEAN DEFAULT TRUE,
  rsvp_deadline TIMESTAMP WITH TIME ZONE,
  max_attendees INTEGER,

  -- Check-in settings
  checkin_enabled BOOLEAN DEFAULT FALSE,
  checkin_start_time TIMESTAMP WITH TIME ZONE,
  checkin_end_time TIMESTAMP WITH TIME ZONE,

  -- Notification tracking
  reminder_sent BOOLEAN DEFAULT FALSE,
  reminder_sent_at TIMESTAMP WITH TIME ZONE,
  checkin_notification_sent BOOLEAN DEFAULT FALSE,
  checkin_notification_sent_at TIMESTAMP WITH TIME ZONE,

  -- Status
  status TEXT DEFAULT 'draft', -- 'draft', 'published', 'cancelled'

  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `event_rsvps` table
```sql
CREATE TABLE public.event_rsvps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,

  -- RSVP details
  rsvp_status TEXT DEFAULT 'attending', -- 'attending', 'maybe', 'not_attending'
  guest_count INTEGER DEFAULT 0,
  notes TEXT,

  -- Check-in tracking
  checked_in BOOLEAN DEFAULT FALSE,
  checked_in_at TIMESTAMP WITH TIME ZONE,
  checked_in_by TEXT, -- 'qr_code', 'manual', 'self'

  -- Timestamps
  rsvp_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT unique_event_rsvp UNIQUE (event_id, member_id)
);
```

---

## Setup & Deployment

### 1. Create Next.js Project

```bash
# In a new directory (not in moyd-member-portal)
npx create-next-app@latest moyd-events-platform --typescript --tailwind --app
cd moyd-events-platform

# Install dependencies
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install @yudiel/react-qr-scanner
npm install date-fns lucide-react
npm install -D @types/node
```

### 2. Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://faajpcarasilbfndzkmd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=https://events.moyoungdemocrats.org
```

### 3. Project Structure

```
moyd-events-platform/
├── app/
│   ├── (public)/
│   │   ├── page.tsx              # Event listing
│   │   ├── events/
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Event detail
│   │   └── layout.tsx
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx          # Login page
│   │   ├── my-events/
│   │   │   └── page.tsx          # User's RSVPs
│   │   └── layout.tsx
│   ├── (admin)/
│   │   ├── admin/
│   │   │   ├── events/
│   │   │   │   ├── page.tsx      # Event management
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx  # Create event
│   │   │   │   └── [id]/
│   │   │   │       ├── edit/
│   │   │   │       │   └── page.tsx  # Edit event
│   │   │   │       └── checkin/
│   │   │   │           └── page.tsx  # Check-in scanner
│   │   │   └── layout.tsx
│   │   └── layout.tsx
│   ├── api/
│   │   └── auth/
│   │       └── callback/
│   │           └── route.ts       # Auth callback
│   └── layout.tsx
├── components/
│   ├── events/
│   │   ├── EventCard.tsx
│   │   ├── EventList.tsx
│   │   ├── EventFilters.tsx
│   │   ├── RSVPButton.tsx
│   │   └── QRScanner.tsx
│   ├── ui/
│   │   └── ... (shadcn components)
│   └── layout/
│       ├── Header.tsx
│       └── Footer.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── hooks/
│   │   ├── useEvents.ts
│   │   ├── useRSVP.ts
│   │   └── useCheckIn.ts
│   └── utils/
│       ├── formatters.ts
│       └── validators.ts
└── types/
    └── database.types.ts
```

### 4. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set up custom domain
# In Vercel Dashboard: Add domain → events.moyoungdemocrats.org
```

---

## User Flows

### 1. Public User Views Events

```
User visits events.moyoungdemocrats.org
  ↓
See list of all published events
  ↓
Can filter by date/location/type
  ↓
Click event → View full details
  ↓
Click RSVP → Prompted to login
  ↓
Login with magic link (existing member)
  ↓
Confirm RSVP → Added to event_rsvps
  ↓
Receive confirmation email
```

### 2. Member Checks In at Event

```
Member arrives at event
  ↓
Opens Apple Wallet → Membership pass
  ↓
Volunteer scans QR code
  ↓
System validates: member_id from QR code
  ↓
Checks if member RSVPd to this event
  ↓
If yes: Mark as checked_in
  ↓
Display success message
  ↓
Log attendance in event_rsvps
```

### 3. Admin Creates Event

```
Admin logs in → /admin/events
  ↓
Click "Create Event"
  ↓
Fill in event details:
  - Title, description
  - Date, time, location
  - RSVP settings
  - Check-in settings
  ↓
Publish event
  ↓
Event appears on public listing
  ↓
(Optional) Send notification to all members
```

### 4. Admin Manages Check-Ins

```
Admin goes to /admin/events/[id]/checkin
  ↓
Opens QR scanner
  ↓
Scan member's wallet pass QR code
  ↓
System shows:
  - Member name
  - RSVP status
  - Already checked in? (yes/no)
  ↓
Confirm check-in
  ↓
Real-time attendance count updates
  ↓
View full attendee list
```

---

## API Integration

### Supabase Client Setup

**`lib/supabase/client.ts`** (Client-side)
```typescript
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database.types';

export const createClient = () => createClientComponentClient<Database>();
```

**`lib/supabase/server.ts`** (Server-side)
```typescript
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database.types';

export const createServerClient = () =>
  createServerComponentClient<Database>({ cookies });
```

### Key Hooks

**`lib/hooks/useEvents.ts`**
```typescript
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Event } from '@/types/database.types';

export function useEvents(filters?: {
  eventType?: string;
  startDate?: string;
  endDate?: string;
}) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchEvents() {
      let query = supabase
        .from('events')
        .select('*')
        .eq('status', 'published')
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true });

      if (filters?.eventType) {
        query = query.eq('event_type', filters.eventType);
      }

      const { data, error } = await query;

      if (!error) setEvents(data || []);
      setLoading(false);
    }

    fetchEvents();

    // Real-time subscription
    const channel = supabase
      .channel('events-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'events',
      }, (payload) => {
        fetchEvents(); // Refresh on changes
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filters]);

  return { events, loading };
}
```

**`lib/hooks/useRSVP.ts`**
```typescript
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useRSVP() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const rsvp = async (eventId: string, guestCount: number = 0) => {
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get member_id from user
    const { data: member } = await supabase
      .from('members')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!member) throw new Error('Member not found');

    const { error } = await supabase
      .from('event_rsvps')
      .upsert({
        event_id: eventId,
        member_id: member.id,
        rsvp_status: 'attending',
        guest_count: guestCount,
      });

    setLoading(false);

    if (error) throw error;
    return true;
  };

  const cancelRSVP = async (eventId: string) => {
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('event_rsvps')
      .delete()
      .eq('event_id', eventId)
      .eq('member_id', user.id);

    setLoading(false);

    if (error) throw error;
    return true;
  };

  return { rsvp, cancelRSVP, loading };
}
```

---

## QR Code Check-In System

### How It Works

1. **QR Code Contains**: Member UUID from membership_cards table
2. **Scanning Process**:
   - Admin opens check-in page for specific event
   - Scans member's wallet pass QR code
   - System extracts member_id from QR code
   - Validates member has RSVPd to this event
   - Marks as checked_in if valid

### QR Scanner Component

**`components/events/QRScanner.tsx`**
```typescript
'use client';

import { useState } from 'react';
import { QrScanner } from '@yudiel/react-qr-scanner';
import { createClient } from '@/lib/supabase/client';

interface QRScannerProps {
  eventId: string;
  onCheckIn: (member: any) => void;
}

export function EventQRScanner({ eventId, onCheckIn }: QRScannerProps) {
  const [scanning, setScanning] = useState(true);
  const [error, setError] = useState('');
  const supabase = createClient();

  const handleScan = async (result: string) => {
    if (!result) return;

    setScanning(false);
    setError('');

    try {
      // QR code contains the member UUID
      const memberId = result;

      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(memberId)) {
        throw new Error('Invalid QR code');
      }

      // Check if member has RSVP for this event
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
        throw new Error('Member already checked in');
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

      onCheckIn(rsvp.members);

      // Reset scanner after 2 seconds
      setTimeout(() => {
        setScanning(true);
        setError('');
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Failed to check in');
      setTimeout(() => {
        setScanning(true);
        setError('');
      }, 3000);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative aspect-square max-w-md mx-auto bg-black rounded-lg overflow-hidden">
        {scanning ? (
          <QrScanner
            onDecode={handleScan}
            onError={(error) => console.error(error)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-green-500 text-white text-2xl font-bold">
            ✓ Checked In!
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-center">
          {error}
        </div>
      )}
    </div>
  );
}
```

### Check-In Page

**`app/(admin)/admin/events/[id]/checkin/page.tsx`**
```typescript
import { createServerClient } from '@/lib/supabase/server';
import { EventQRScanner } from '@/components/events/QRScanner';
import { AttendeeList } from '@/components/events/AttendeeList';

export default async function CheckInPage({
  params
}: {
  params: { id: string }
}) {
  const supabase = createServerClient();

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', params.id)
    .single();

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
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{event?.title}</h1>
        <div className="flex gap-4 text-lg">
          <div>
            <span className="font-semibold">RSVPs:</span> {count}
          </div>
          <div>
            <span className="font-semibold">Checked In:</span> {checkedInCount}
          </div>
          <div>
            <span className="font-semibold">Attendance Rate:</span>{' '}
            {count ? Math.round((checkedInCount / count) * 100) : 0}%
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Scan QR Code</h2>
          <EventQRScanner eventId={params.id} />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Attendees</h2>
          <AttendeeList rsvps={rsvps || []} eventId={params.id} />
        </div>
      </div>
    </div>
  );
}
```

---

## Real-Time Updates

The platform uses Supabase Realtime for live updates:

### Event List Updates
```typescript
// Auto-refresh when events are created/updated
const channel = supabase
  .channel('events-changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'events',
  }, (payload) => {
    // Refresh event list
  })
  .subscribe();
```

### Check-In Updates
```typescript
// Real-time attendance tracking
const channel = supabase
  .channel(`event-${eventId}-checkins`)
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'event_rsvps',
    filter: `event_id=eq.${eventId}`,
  }, (payload) => {
    // Update attendee count in real-time
  })
  .subscribe();
```

---

## Security & Permissions

### Row Level Security (RLS) Policies

#### Events Table
```sql
-- Public can view published events
CREATE POLICY "Anyone can view published events"
  ON public.events
  FOR SELECT
  USING (status = 'published');

-- Admins can manage all events
CREATE POLICY "Admins can manage events"
  ON public.events
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM members WHERE is_admin = TRUE
    )
  );
```

#### Event RSVPs Table
```sql
-- Members can create their own RSVPs
CREATE POLICY "Members can create own RSVPs"
  ON public.event_rsvps
  FOR INSERT
  WITH CHECK (member_id = auth.uid());

-- Members can view their own RSVPs
CREATE POLICY "Members can view own RSVPs"
  ON public.event_rsvps
  FOR SELECT
  USING (member_id = auth.uid());

-- Admins can view all RSVPs and update check-ins
CREATE POLICY "Admins can manage RSVPs"
  ON public.event_rsvps
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM members WHERE is_admin = TRUE
    )
  );
```

---

## Integration with Existing Systems

### 1. Member Portal Integration
- Events link in member dashboard
- "My Events" page shows user's RSVPs
- Wallet notifications for event reminders

### 2. Wallet Pass Integration
- QR codes in wallet passes contain member_id
- Used for event check-ins
- Receive event notifications via wallet

### 3. CRM Integration
- View which members RSVPd to events
- Send targeted notifications
- Track member engagement

---

## Deployment Checklist

- [ ] Run event tables migration in Supabase
- [ ] Create Next.js project
- [ ] Set up environment variables
- [ ] Build core pages (listing, detail, admin)
- [ ] Implement QR scanner
- [ ] Deploy to Vercel
- [ ] Configure custom domain (events.moyoungdemocrats.org)
- [ ] Set up SSL/HTTPS
- [ ] Test end-to-end flows
- [ ] Train admin users on check-in system

---

## Future Enhancements

- [ ] Calendar integration (Google Calendar, iCal)
- [ ] Email reminders (automated)
- [ ] SMS notifications (optional)
- [ ] Event photos/gallery
- [ ] Post-event surveys
- [ ] Recurring events
- [ ] Virtual event support (Zoom links)
- [ ] Waitlist functionality
- [ ] Event categories/tags
- [ ] Advanced analytics dashboard

---

**Last Updated**: November 2025
