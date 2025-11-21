# MOYD Events Platform

A custom-coded events platform integrated with MOYD's Supabase backend, Apple/Google Wallet system, and membership CRM.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   - Copy `.env.example` to `.env.local`
   - Add your Supabase credentials

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Visit [http://localhost:3000](http://localhost:3000)

## Project Structure

```
moyd-events-platform/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── (public)/          # Public pages (events listing, detail)
│   │   ├── (admin)/           # Admin pages (check-in, management)
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   ├── events/            # Event-specific components
│   │   └── ui/                # Reusable UI components
│   ├── lib/
│   │   ├── hooks/             # Custom React hooks
│   │   ├── supabase/          # Supabase client/server setup
│   │   └── utils/             # Utility functions
│   └── types/                 # TypeScript type definitions
├── public/                     # Static assets
└── middleware.ts              # Next.js middleware for auth
```

## Features

### Public Features
- Event listing and search
- Event detail pages
- RSVP functionality
- Member dashboard

### Admin Features
- QR code check-in system
- Real-time attendance tracking
- Event management
- Analytics

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase PostgreSQL
- **Authentication:** Supabase Auth
- **QR Scanner:** @yudiel/react-qr-scanner

## Documentation

See the following files for detailed documentation:
- [EVENTS-PLATFORM.md](./EVENTS-PLATFORM.md) - Complete architecture and setup guide
- [EVENTS-PLATFORM-CODE.md](./EVENTS-PLATFORM-CODE.md) - All code files reference

## Deployment

Deploy to Vercel:

```bash
npm install -g vercel
vercel
```

Then configure your custom domain in the Vercel dashboard.

## Environment Variables

Required environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=https://events.moyoungdemocrats.org
NEXT_PUBLIC_APPLE_MAPKIT_TOKEN=your-apple-mapkit-js-token
```

### Getting Apple MapKit JS Token

The embedded map on event location pages uses Apple Maps via MapKit JS. To set this up:

1. Sign in to your [Apple Developer account](https://developer.apple.com/account/)
2. Go to **Certificates, Identifiers & Profiles**
3. Select **Keys** from the sidebar
4. Click the **+** button to create a new key
5. Give it a name (e.g., "MapKit JS Key")
6. Enable **MapKit JS** checkbox
7. Click **Continue**, then **Register**
8. Copy the generated token and add it to your `.env.local` file as `NEXT_PUBLIC_APPLE_MAPKIT_TOKEN`

Note: You'll need an Apple Developer account (free or paid) to generate this token.

## License

© 2025 Missouri Young Democrats. All rights reserved.
