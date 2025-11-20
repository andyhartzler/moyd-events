'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Phone } from 'lucide-react';

interface PhoneNumberLookupProps {
  onPersonFound: (person: any, type: 'member' | 'donor') => void;
  onNotFound: (phoneNumber: string) => void;
  loading: boolean;
  eventId: string;
}

export function PhoneNumberLookup({ onPersonFound, onNotFound, loading, eventId }: PhoneNumberLookupProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [searching, setSearching] = useState(false);
  const [smsSent, setSmsSent] = useState(false);
  const [sendingSms, setSendingSms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const formatPhoneNumber = (value: string) => {
    // Remove all non-numeric characters
    const numbers = value.replace(/\D/g, '');

    // Format as (XXX) XXX-XXXX
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 6) {
      return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    } else {
      return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  const sendCheckInSMS = async (phone: string) => {
    setSendingSms(true);
    setError(null);

    try {
      // Extract just the numbers for the API
      const cleanPhone = phone.replace(/\D/g, '');

      // Build the check-in URL with phone pre-filled
      const checkinUrl = `${window.location.origin}/events/${eventId}/checkin?phone=${encodeURIComponent(cleanPhone)}`;

      // Call your CRM API to send SMS
      // This endpoint should be implemented in your CRM system
      const response = await fetch('/api/crm/send-checkin-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: cleanPhone,
          eventId: eventId,
          checkinUrl: checkinUrl,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send SMS');
      }

      setSmsSent(true);
    } catch (err: any) {
      console.error('SMS send error:', err);
      setError('Unable to send SMS. Please continue with in-person registration.');
    } finally {
      setSendingSms(false);
    }
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Extract just the numbers
    const cleanPhone = phoneNumber.replace(/\D/g, '');

    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setSearching(true);
    setError(null);

    try {
      // Search members by phone
      const { data: members } = await supabase
        .from('members')
        .select('id, name, email, phone, address, city, state, zip_code, date_of_birth, occupation')
        .or(`phone.eq.${cleanPhone},phone.eq.${phoneNumber}`)
        .limit(1);

      if (members && members.length > 0) {
        onPersonFound(members[0], 'member');
        return;
      }

      // Search donors by phone
      const { data: donors } = await supabase
        .from('donors')
        .select('id, name, email, phone, address, city, state, zip_code, occupation, total_donated, is_recurring_donor')
        .or(`phone.eq.${cleanPhone},phone.eq.${phoneNumber}`)
        .limit(1);

      if (donors && donors.length > 0) {
        onPersonFound(donors[0], 'donor');
        return;
      }

      // Not found - send SMS with check-in link
      setSearching(false);
      await sendCheckInSMS(phoneNumber);
    } catch (err: any) {
      console.error('Lookup error:', err);
      setError('An error occurred. Please try again.');
      setSearching(false);
    }
  };

  // Show SMS sent message
  if (smsSent) {
    return (
      <div className="text-center">
        <div className="mb-6 p-6 bg-blue-50 border-2 border-blue-200 rounded-xl">
          <div className="text-5xl mb-4">📱</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Check Your Phone!
          </h3>
          <p className="text-gray-700 mb-1">
            We've sent you a text message with a link to complete your check-in.
          </p>
          <p className="text-sm text-gray-600">
            Check your messages at <strong>{phoneNumber}</strong>
          </p>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-3">
            Don't have your phone handy?
          </p>
          <button
            onClick={() => onNotFound(phoneNumber)}
            className="text-primary font-semibold hover:underline"
          >
            Continue with in-person registration →
          </button>
        </div>

        <button
          onClick={() => {
            setSmsSent(false);
            setPhoneNumber('');
            setError(null);
          }}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Try a different phone number
        </button>
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={handleLookup}>
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Phone className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="tel"
            placeholder="(555) 123-4567"
            value={phoneNumber}
            onChange={handlePhoneChange}
            maxLength={14}
            className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            disabled={loading || searching || sendingSms}
            autoFocus
          />
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || searching || sendingSms || phoneNumber.replace(/\D/g, '').length !== 10}
          className="check-in-button w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {searching ? 'Looking up...' : sendingSms ? 'Sending SMS...' : 'Continue'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Enter your phone number to check in</p>
        <p className="mt-1">We'll find your information automatically</p>
      </div>
    </div>
  );
}
