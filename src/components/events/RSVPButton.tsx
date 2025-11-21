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
      // Redirect to public registration page
      router.push(`/events/${eventId}/register`);
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
        className="w-full text-lg py-6 h-14"
      >
        {loading ? 'Loading...' : hasRSVPd ? 'Cancel RSVP' : 'RSVP Now'}
      </Button>
      {error && (
        <p className="text-sm text-red-600 mt-2">{error}</p>
      )}
    </div>
  );
}
