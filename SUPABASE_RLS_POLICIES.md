# Required Supabase RLS Policies

## Events Table - Public Read Access

For events to display on the public website, the following RLS policy must be enabled on the `events` table:

### Policy: "Allow public read access to published events"

```sql
CREATE POLICY "Allow public read access to published events"
ON public.events
FOR SELECT
USING (status = 'published');
```

This policy allows:
- Anyone (including anonymous users) to SELECT/read events
- Only events where `status = 'published'` are visible
- Draft and cancelled events remain hidden from public view

## Alternative: Disable RLS (Not Recommended)

If you want to allow unrestricted access to all events:

```sql
ALTER TABLE public.events DISABLE ROW LEVEL SECURITY;
```

⚠️ **Warning:** This is not recommended for production as it exposes all events regardless of status.

## Current Application Behavior

The application queries events with:
- `status = 'published'`
- `event_date >= current date` (future events only)

Without the proper RLS policy, the query will return 0 events even if published events exist in the database.

## How to Add the Policy in Supabase Dashboard

1. Go to **Authentication** → **Policies**
2. Select the `events` table
3. Click **New Policy**
4. Choose **SELECT** operation
5. Set policy name: "Allow public read access to published events"
6. Set USING expression: `status = 'published'`
7. Click **Save**

## Verifying the Policy

After adding the policy, test by:
1. Ensuring you have at least one event with `status = 'published'` and a future `event_date`
2. Checking the application logs for "Events fetched: X" where X > 0
3. Verifying events display on the homepage
