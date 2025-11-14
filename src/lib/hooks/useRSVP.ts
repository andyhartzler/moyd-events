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
