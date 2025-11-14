import { createClient } from '@/lib/supabase/server';
import { EventQRScanner } from '@/components/events/QRScanner';
import { notFound } from 'next/navigation';
import { Users, UserCheck, TrendingUp, QrCode, CheckCircle } from 'lucide-react';
import Link from 'next/link';

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
  const attendanceRate = count ? Math.round((checkedInCount / count) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="gradient-primary text-white shadow-lg">
        <div className="container-custom py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">{event.title}</h1>
              <p className="text-primary-100">Event Check-In Dashboard</p>
            </div>
            <Link
              href={`/events/${params.id}`}
              className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-semibold transition-all"
            >
              View Event
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 text-white/80" />
                <span className="text-4xl font-bold">{count || 0}</span>
              </div>
              <div className="text-primary-100 font-medium">Total RSVPs</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <UserCheck className="w-8 h-8 text-green-300" />
                <span className="text-4xl font-bold text-green-300">{checkedInCount}</span>
              </div>
              <div className="text-primary-100 font-medium">Checked In</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-yellow-300" />
                <span className="text-4xl font-bold text-yellow-300">{attendanceRate}%</span>
              </div>
              <div className="text-primary-100 font-medium">Attendance Rate</div>
              <div className="mt-2 w-full bg-white/20 rounded-full h-2">
                <div
                  className="bg-yellow-300 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${attendanceRate}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-custom py-12">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* QR Scanner Section */}
          <div>
            <div className="bg-white rounded-xl shadow-soft p-8">
              <div className="flex items-center mb-6">
                <div className="bg-primary-100 p-3 rounded-lg mr-4">
                  <QrCode className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-primary">QR Code Scanner</h2>
                  <p className="text-gray-600">Scan member passes to check them in</p>
                </div>
              </div>
              <EventQRScanner eventId={params.id} />
            </div>
          </div>

          {/* Attendees List Section */}
          <div>
            <div className="bg-white rounded-xl shadow-soft p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="bg-primary-100 p-3 rounded-lg mr-4">
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-primary">
                      Attendees ({checkedInCount}/{count})
                    </h2>
                    <p className="text-gray-600">Real-time check-in list</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {rsvps && rsvps.length > 0 ? (
                  rsvps.map((rsvp) => (
                    <div
                      key={rsvp.id}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        rsvp.checked_in
                          ? 'bg-green-50 border-green-300 shadow-sm'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                            rsvp.checked_in ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                          }`}>
                            {rsvp.members.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{rsvp.members.name}</div>
                            <div className="text-sm text-gray-600">{rsvp.members.email}</div>
                          </div>
                        </div>
                        {rsvp.checked_in ? (
                          <div className="flex items-center space-x-2 text-green-600">
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-semibold">Checked In</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500 font-medium">Pending</span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No RSVPs yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
