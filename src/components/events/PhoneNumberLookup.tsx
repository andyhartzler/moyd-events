'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Phone } from 'lucide-react';

interface PhoneNumberLookupProps {
  onPersonFound: (person: any, type: 'member' | 'donor') => void;
  onNotFound: (phoneNumber: string) => void;
  loading: boolean;
}

export function PhoneNumberLookup({ onPersonFound, onNotFound, loading }: PhoneNumberLookupProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [searching, setSearching] = useState(false);
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

      // Not found - trigger guest registration
      onNotFound(phoneNumber);
    } catch (err: any) {
      console.error('Lookup error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setSearching(false);
    }
  };

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
            disabled={loading || searching}
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
          disabled={loading || searching || phoneNumber.replace(/\D/g, '').length !== 10}
          className="check-in-button w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {searching ? 'Looking up...' : 'Continue'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Enter your phone number to check in</p>
        <p className="mt-1">We'll find your information automatically</p>
      </div>
    </div>
  );
}
