'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PhoneNumberLookup } from './PhoneNumberLookup';
import { GuestRegistrationForm, GuestData, isMemberEligible } from './GuestRegistrationForm';
import { CheckCircle, Calendar, MapPin, ArrowLeft, DollarSign, Heart } from 'lucide-react';
import { formatEventDate } from '@/lib/utils/formatters';
import Link from 'next/link';

interface SelfCheckInProps {
  event: any;
  existingRSVP: any | null;
  memberInfo: any | null;
}

type CheckInState = 'initial' | 'phone_lookup' | 'confirm_person' | 'guest_registration' | 'success' | 'already_checked_in';

export function SelfCheckIn({ event, existingRSVP, memberInfo }: SelfCheckInProps) {
  const [state, setState] = useState<CheckInState>(() => {
    if (existingRSVP?.checked_in) return 'already_checked_in';
    if (existingRSVP && !existingRSVP.checked_in) return 'initial';
    return 'phone_lookup';
  });
  const [foundPerson, setFoundPerson] = useState<any>(null);
  const [personType, setPersonType] = useState<'member' | 'donor' | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkedInAt, setCheckedInAt] = useState<Date | null>(
    existingRSVP?.checked_in_at ? new Date(existingRSVP.checked_in_at) : null
  );
  const supabase = createClient();

  // Quick check-in for pre-registered users
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

      setFoundPerson(memberInfo);
      setCheckedInAt(now);
      setState('success');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle when person is found via phone lookup
  const handlePersonFound = async (person: any, type: 'member' | 'donor') => {
    setFoundPerson(person);
    setPersonType(type);
    setState('confirm_person');
  };

  // Handle when person is not found
  const handleNotFound = (phone: string) => {
    setPhoneNumber(phone);
    setState('guest_registration');
  };

  // Handle confirmation of found person
  const handleConfirmCheckIn = async () => {
    if (!foundPerson) return;

    setLoading(true);
    setError(null);

    try {
      // For members, use member_id. For donors without member_id, we need to handle differently
      const memberId = personType === 'member' ? foundPerson.id : foundPerson.member_id;

      if (memberId) {
        // Check if they already have an RSVP
        const { data: existingRsvp } = await supabase
          .from('event_rsvps')
          .select('*')
          .eq('event_id', event.id)
          .eq('member_id', memberId)
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
              checked_in_by: 'phone_lookup',
            })
            .eq('id', existingRsvp.id);

          if (updateError) throw updateError;
          setCheckedInAt(now);
        } else {
          // Create new RSVP
          const now = new Date();
          const { error: insertError } = await supabase
            .from('event_rsvps')
            .insert({
              event_id: event.id,
              member_id: memberId,
              rsvp_status: 'attending',
              guest_count: 0,
              checked_in: true,
              checked_in_at: now.toISOString(),
              checked_in_by: 'phone_lookup',
            });

          if (insertError) throw insertError;
          setCheckedInAt(now);
        }
      } else {
        // Donor without member_id - create a guest check-in record
        // Note: This would require a separate table or handling mechanism
        // For now, we'll show an error
        throw new Error('Donors must be linked to a member account to check in. Please register as a guest.');
      }

      setState('success');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle guest registration and check-in
  const handleGuestCheckIn = async (guestData: GuestData) => {
    setLoading(true);
    setError(null);

    try {
      // Determine if they qualify as a member (under 36 and living in MO)
      const isEligible = isMemberEligible(guestData.date_of_birth, guestData.state);
      const memberStatus = isEligible ? 'active' : 'guest';

      // First, create a member record for the guest
      const { data: newMember, error: memberError } = await supabase
        .from('members')
        .insert({
          name: guestData.name,
          email: guestData.email,
          phone: guestData.phone,
          date_of_birth: guestData.date_of_birth,
          address: guestData.address,
          city: guestData.city,
          state: guestData.state,
          zip_code: guestData.zip_code,
          occupation: guestData.occupation,
          member_status: memberStatus,
        })
        .select()
        .single();

      if (memberError) throw memberError;

      // Then create RSVP and check them in
      const now = new Date();
      const { error: rsvpError } = await supabase
        .from('event_rsvps')
        .insert({
          event_id: event.id,
          member_id: newMember.id,
          rsvp_status: 'attending',
          guest_count: 0,
          checked_in: true,
          checked_in_at: now.toISOString(),
          checked_in_by: 'guest_registration',
        });

      if (rsvpError) throw rsvpError;

      setFoundPerson(newMember);
      setCheckedInAt(now);
      setState('success');
    } catch (err: any) {
      setError(err.message);
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
            Welcome, {foundPerson?.name || memberInfo?.name}!
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            You're checked in to {event.title}
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Checked in at {checkedInAt?.toLocaleTimeString()}
          </p>

          {/* Show donor badge if applicable */}
          {personType === 'donor' && foundPerson?.total_donated && (
            <div className="mb-8 inline-flex items-center px-6 py-3 bg-blue-50 border-2 border-blue-200 rounded-full">
              <DollarSign className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-blue-900 font-semibold">
                Thank you for your ${foundPerson.total_donated} in contributions!
              </span>
              {foundPerson.is_recurring_donor && (
                <Heart className="w-5 h-5 text-red-500 ml-2" />
              )}
            </div>
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
            {foundPerson?.name || memberInfo?.name}, you checked in earlier
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
      <div className="glass-card rounded-2xl p-8">
        {/* Quick check-in for pre-registered users */}
        {state === 'initial' && existingRSVP && !existingRSVP.checked_in ? (
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
              onClick={() => setState('phone_lookup')}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Not you? Enter phone number
            </button>
          </div>
        ) : state === 'phone_lookup' ? (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Check In to Event
            </h2>
            <PhoneNumberLookup
              onPersonFound={handlePersonFound}
              onNotFound={handleNotFound}
              loading={loading}
              eventId={event.id}
            />
          </div>
        ) : state === 'confirm_person' ? (
          <div className="text-center">
            <div className="mb-6">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-primary">
                  {foundPerson?.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Is this you?
              </h2>
              <p className="text-xl text-gray-700 font-semibold mb-1">
                {foundPerson?.name}
              </p>
              <p className="text-gray-600 mb-4">
                {foundPerson?.email}
              </p>

              {/* Show donor info if applicable */}
              {personType === 'donor' && foundPerson?.total_donated && (
                <div className="mb-4 inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-full">
                  <DollarSign className="w-4 h-4 text-blue-600 mr-1" />
                  <span className="text-sm text-blue-900 font-semibold">
                    ${foundPerson.total_donated} donated
                  </span>
                  {foundPerson.is_recurring_donor && (
                    <Heart className="w-4 h-4 text-red-500 ml-2" />
                  )}
                </div>
              )}
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleConfirmCheckIn}
              disabled={loading}
              className="check-in-button w-full mb-4 py-4 text-lg"
            >
              {loading ? 'Checking in...' : '✓ Yes, Check Me In'}
            </button>

            <button
              onClick={() => setState('phone_lookup')}
              disabled={loading}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Not you? Try again
            </button>
          </div>
        ) : state === 'guest_registration' ? (
          <GuestRegistrationForm
            phoneNumber={phoneNumber}
            onSubmit={handleGuestCheckIn}
            onBack={() => setState('phone_lookup')}
            loading={loading}
          />
        ) : null}

        {error && state !== 'confirm_person' && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
