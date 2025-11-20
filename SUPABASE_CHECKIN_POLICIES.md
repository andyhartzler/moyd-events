# Supabase Database Policies for Check-In System

## Required SQL Policies

Execute these SQL statements in your Supabase SQL Editor to enable the check-in functionality:

### 1. Allow Users to Check Themselves In
This policy allows authenticated users to update their own RSVP records to mark themselves as checked in.

```sql
CREATE POLICY IF NOT EXISTS "Users can check themselves in"
ON event_rsvps
FOR UPDATE
USING (auth.uid() = member_id)
WITH CHECK (auth.uid() = member_id);
```

### 2. Allow Walk-In Check-Ins
This policy allows creating new RSVPs during the check-in process for walk-in attendees who didn't RSVP beforehand.

```sql
CREATE POLICY IF NOT EXISTS "Allow walk-in check-ins"
ON event_rsvps
FOR INSERT
WITH CHECK (checked_in_by IN ('walk_in', 'self') OR auth.uid() = member_id);
```

### 3. Allow Reading Event RSVPs
This policy allows anyone to view event RSVPs (you may already have this policy).

```sql
CREATE POLICY IF NOT EXISTS "Anyone can view event RSVPs"
ON event_rsvps
FOR SELECT
USING (true);
```

### 4. Allow Member Search
This policy enables the member search functionality during check-in.

```sql
CREATE POLICY IF NOT EXISTS "Anyone can search members"
ON members
FOR SELECT
USING (true);
```

## Database Schema Requirements

Make sure your `event_rsvps` table has these columns:

- `id` (uuid, primary key)
- `event_id` (uuid, foreign key to events table)
- `member_id` (uuid, foreign key to members table)
- `rsvp_status` (text)
- `guest_count` (integer)
- `checked_in` (boolean)
- `checked_in_at` (timestamptz)
- `checked_in_by` (text) - values: 'self', 'walk_in', 'admin', etc.
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

Make sure your `events` table has:
- `checkin_enabled` (boolean) - to control whether check-in is available for an event

## How to Apply

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste each SQL statement above
4. Execute each one individually or all together
5. Verify that the policies were created successfully

## Testing the Policies

After creating the policies, test the following scenarios:

1. **Authenticated user with RSVP**: Can update their own check-in status
2. **Walk-in user**: Can create a new RSVP and check in
3. **Member search**: Anyone can search the members table by name/email
4. **Security**: Users cannot modify other users' RSVPs

## Troubleshooting

If you encounter permission errors:

1. Check that Row Level Security (RLS) is enabled on the tables
2. Verify that the policies are created without errors
3. Ensure the `checked_in_by` column exists in `event_rsvps`
4. Check that the `checkin_enabled` column exists in `events`
5. Make sure your Supabase client is properly configured in the application

## Additional Security Considerations

- The policies allow anyone to search members, which is necessary for the check-in flow
- Only name and email are exposed in the search results
- Users can only update their own RSVP records
- Walk-in check-ins are tracked with `checked_in_by = 'walk_in'` for audit purposes
