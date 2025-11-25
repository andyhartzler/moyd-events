'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useRSVP } from '@/lib/hooks/useRSVP';
import { createClient } from '@/lib/supabase/client';

interface RSVPButtonProps {
  eventId: string;
  hasRSVPd: boolean;
  eventDate: string;
}

export function RSVPButton({ eventId, hasRSVPd: initialRSVP, eventDate }: RSVPButtonProps) {
  const [hasRSVPd, setHasRSVPd] = useState(initialRSVP);
  const [localError, setLocalError] = useState<string | null>(null);
  const { rsvp, loading, error } = useRSVP();
  const router = useRouter();
  const supabase = createClient();

  const handleRSVP = async () => {
    setLocalError(null);

    // Check if event is more than 2 hours past
    const eventDateTime = new Date(eventDate);
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

    if (eventDateTime < twoHoursAgo) {
      // Redirect to event-passed page
      router.push(`/events/${eventId}/event-passed`);
      return;
    }

    // Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser();

    // Allow cancellation for guest RSVPs using stored contact info
    if (!user && !hasRSVPd) {
      // Redirect to public registration page
      router.push(`/events/${eventId}/register`);
      return;
    }

    if (hasRSVPd) {
      setLocalError("You're already RSVP'd for this event.");
      return;
    }

    const success = await rsvp(eventId);
    if (success) {
      setHasRSVPd(true);
      router.refresh();
    }
  };

  return (
    <div>
      <Button
        onClick={handleRSVP}
        variant={hasRSVPd ? 'outline' : 'default'}
        size="lg"
        className="w-full text-lg py-6 h-14"
        disabled={loading || hasRSVPd}
      >
        {loading ? 'Loading...' : hasRSVPd ? "You're already RSVP'd" : 'RSVP Now'}
      </Button>
      {(error || localError) && (
        <p className="text-sm text-red-600 mt-2">{error ?? localError}</p>
      )}
    </div>
  );
}
