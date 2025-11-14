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
