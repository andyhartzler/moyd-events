import { createClient } from '@/lib/supabase/server';
import { SelfCheckIn } from '@/components/events/SelfCheckIn';
import { notFound } from 'next/navigation';

export default async function PublicCheckInPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  // Fetch event details
  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!event || !event.checkin_enabled) notFound();

  // Check if user is authenticated and has RSVP
  const { data: { user } } = await supabase.auth.getUser();
  let existingRSVP = null;
  let memberInfo = null;

  if (user) {
    const { data: rsvp } = await supabase
      .from('event_rsvps')
      .select('*, members!inner(id, name, email)')
      .eq('event_id', params.id)
      .eq('member_id', user.id)
      .single();

    existingRSVP = rsvp;

    if (rsvp?.members) {
      memberInfo = rsvp.members;
    }
  }

  return (
    <div className="min-h-screen py-12">
      <SelfCheckIn
        event={event}
        existingRSVP={existingRSVP}
        memberInfo={memberInfo}
      />
    </div>
  );
}
