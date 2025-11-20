'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MemberSearch } from './MemberSearch';
import { CheckCircle, Calendar, MapPin, ArrowLeft } from 'lucide-react';
import { formatEventDate } from '@/lib/utils/formatters';
import Link from 'next/link';

interface SelfCheckInProps {
  event: any;
  existingRSVP: any | null;
  memberInfo: any | null;
}

type CheckInState = 'initial' | 'searching' | 'success' | 'error' | 'already_checked_in';

export function SelfCheckIn({ event, existingRSVP, memberInfo }: SelfCheckInProps) {
  const [state, setState] = useState<CheckInState>(() => {
    if (existingRSVP?.checked_in) return 'already_checked_in';
    if (existingRSVP && !existingRSVP.checked_in) return 'initial';
    return 'searching';
  });
  const [selectedMember, setSelectedMember] = useState(memberInfo);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkedInAt, setCheckedInAt] = useState<Date | null>(
    existingRSVP?.checked_in_at ? new Date(existingRSVP.checked_in_at) : null
  );
  const supabase = createClient();

  const handleQuickCheckIn = async () => {
    if (!existingRSVP) return;

    setLoading(true);
    setError(null);

    try {
      const now = new Date();
      const { error: updateError } = await supabase
        .from('event_rsvps')
        .update({
          checked_in: true,
          checked_in_at: now.toISOString(),
          checked_in_by: 'self',
        })
        .eq('id', existingRSVP.id);

      if (updateError) throw updateError;

      setCheckedInAt(now);
      setState('success');
    } catch (err: any) {
      setError(err.message);
      setState('error');
    } finally {
      setLoading(false);
    }
  };

  const handleWalkInCheckIn = async (member: any) => {
    setLoading(true);
    setError(null);
    setSelectedMember(member);

    try {
      // Check if they already have an RSVP
      const { data: existingRsvp } = await supabase
        .from('event_rsvps')
        .select('*')
        .eq('event_id', event.id)
        .eq('member_id', member.id)
        .single();

      if (existingRsvp) {
        if (existingRsvp.checked_in) {
          setCheckedInAt(new Date(existingRsvp.checked_in_at));
          setState('already_checked_in');
          return;
        }

        // Update existing RSVP
        const now = new Date();
        const { error: updateError } = await supabase
          .from('event_rsvps')
          .update({
            checked_in: true,
            checked_in_at: now.toISOString(),
            checked_in_by: 'walk_in',
          })
          .eq('id', existingRsvp.id);

        if (updateError) throw updateError;
        setCheckedInAt(now);
      } else {
        // Create new RSVP and mark as checked in
        const now = new Date();
        const { error: insertError } = await supabase
          .from('event_rsvps')
          .insert({
            event_id: event.id,
            member_id: member.id,
            rsvp_status: 'attending',
            guest_count: 0,
            checked_in: true,
            checked_in_at: now.toISOString(),
            checked_in_by: 'walk_in',
          });

        if (insertError) throw insertError;
        setCheckedInAt(now);
      }

      setState('success');
    } catch (err: any) {
      setError(err.message);
      setState('error');
    } finally {
      setLoading(false);
    }
  };

  // Success state
  if (state === 'success') {
    return (
      <div className="container-custom max-w-2xl">
        <Link
          href={`/events/${event.id}`}
          className="inline-flex items-center text-[#273351] hover:opacity-70 font-medium transition-opacity mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Event
        </Link>

        <div className="glass-card rounded-2xl p-12 text-center animate-fade-in">
          <div className="mb-8">
            <CheckCircle className="w-24 h-24 text-green-500 mx-auto success-checkmark" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome, {selectedMember?.name || memberInfo?.name}!
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            You're checked in to {event.title}
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Checked in at {checkedInAt?.toLocaleTimeString()}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/events/${event.id}`}
              className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-all shadow-md"
            >
              View Event Details
            </Link>
            <Link
              href="/"
              className="bg-white text-primary border-2 border-primary px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-all"
            >
              Back to Events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Already checked in state
  if (state === 'already_checked_in') {
    return (
      <div className="container-custom max-w-2xl">
        <Link
          href={`/events/${event.id}`}
          className="inline-flex items-center text-[#273351] hover:opacity-70 font-medium transition-opacity mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Event
        </Link>

        <div className="glass-card rounded-2xl p-12 text-center">
          <div className="mb-8">
            <CheckCircle className="w-24 h-24 text-blue-500 mx-auto" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            You're Already Checked In!
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            {selectedMember?.name || memberInfo?.name}, you checked in earlier
          </p>
          {checkedInAt && (
            <p className="text-sm text-gray-500 mb-8">
              Checked in at {checkedInAt.toLocaleTimeString()}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/events/${event.id}`}
              className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-all shadow-md"
            >
              View Event Details
            </Link>
            <Link
              href="/"
              className="bg-white text-primary border-2 border-primary px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-all"
            >
              Back to Events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Main check-in interface
  return (
    <div className="container-custom max-w-2xl">
      <Link
        href={`/events/${event.id}`}
        className="inline-flex items-center text-[#273351] hover:opacity-70 font-medium transition-opacity mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Event
      </Link>

      {/* Event Header */}
      <div className="glass-card rounded-2xl p-8 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {event.title}
        </h1>
        <div className="flex flex-wrap gap-4 text-gray-600">
          <div className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            {formatEventDate(event.event_date)}
          </div>
          {event.location && (
            <div className="flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              {event.location}
            </div>
          )}
        </div>
      </div>

      {/* Check-In Interface */}
      {state === 'initial' && existingRSVP && !existingRSVP.checked_in ? (
        <div className="glass-card rounded-2xl p-8">
          <div className="text-center">
            <div className="mb-6">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-primary">
                  {memberInfo?.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome back, {memberInfo?.name}!
              </h2>
              <p className="text-gray-600">
                You're registered for this event. Ready to check in?
              </p>
            </div>

            <button
              onClick={handleQuickCheckIn}
              disabled={loading}
              className="check-in-button w-full mb-4 py-4 text-lg"
            >
              {loading ? 'Checking in...' : '✓ Check In Now'}
            </button>

            <button
              onClick={() => setState('searching')}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Not you? Search directory
            </button>
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Find Yourself to Check In
          </h2>
          <MemberSearch
            onSelectMember={handleWalkInCheckIn}
            loading={loading}
          />
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
