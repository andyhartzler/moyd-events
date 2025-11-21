'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Loader2, Phone, AlertCircle } from 'lucide-react';
import { PublicRegistrationForm } from './PublicRegistrationForm';

interface PhoneLookupFormProps {
  eventId: string;
  eventName: string;
  eventType: string | null;
  prefilledPhone?: string;
}

export function PhoneLookupForm({ eventId, eventName, eventType, prefilledPhone }: PhoneLookupFormProps) {
  const [step, setStep] = useState<'phone' | 'success' | 'not-found' | 'already-registered'>('phone');
  const [phone, setPhone] = useState(prefilledPhone || '');
  const [userName, setUserName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const handlePhoneLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://faajpcarasilbfndzkmd.supabase.co/functions/v1/rsvp-by-phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phone,
          eventId: eventId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process request');
      }

      // Handle the 3 possible outcomes
      if (data.success && data.found) {
        // Successfully RSVPd
        setUserName(data.name || '');
        setStep('success');
      } else if (!data.success && data.found) {
        // Already registered
        setUserName(data.name || '');
        setStep('already-registered');
      } else if (!data.found) {
        // Not found, show form
        setStep('not-found');
      }
    } catch (err: any) {
      console.error('Lookup error:', err);
      setError('Failed to process your request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Phone number entry
  if (step === 'phone') {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Register for Event
          </h2>
          <p className="text-gray-600">
            Enter your phone number to register.
          </p>
        </div>

        <form onSubmit={handlePhoneLookup} className="space-y-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
              Phone Number *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="(555) 123-4567"
                required
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !phone}
            className="w-full bg-primary text-white py-4 rounded-lg font-semibold hover:opacity-90 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Continue'
            )}
          </button>
        </form>
      </div>
    );
  }

  // Step 2a: Success - user found and RSVPd
  if (step === 'success') {
    return (
      <div className="text-center py-8">
        <div className="mb-8">
          <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-4 animate-fade-in" />
          <h3 className="text-3xl font-bold text-gray-900 mb-2">
            You're Registered!
          </h3>
          <p className="text-lg text-gray-600 mb-4">
            Thank you{userName ? `, ${userName}` : ''}!
          </p>
          <p className="text-gray-600">
            We've saved your spot for {eventName}. We look forward to seeing you there!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push(`/events/${eventId}`)}
            className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-all shadow-md"
          >
            View Event Details
          </button>
          <button
            onClick={() => router.push('/')}
            className="bg-white text-primary border-2 border-primary px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-all"
          >
            Browse More Events
          </button>
        </div>
      </div>
    );
  }

  // Step 2b: Already registered
  if (step === 'already-registered') {
    return (
      <div className="text-center py-8">
        <div className="mb-8">
          <AlertCircle className="w-24 h-24 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-3xl font-bold text-gray-900 mb-2">
            Already Registered
          </h3>
          <p className="text-lg text-gray-600 mb-4">
            {userName ? `${userName}, you're` : "You've"} already registered for this event!
          </p>
          <p className="text-gray-600">
            We look forward to seeing you at {eventName}.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push(`/events/${eventId}`)}
            className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-all shadow-md"
          >
            View Event Details
          </button>
          <button
            onClick={() => router.push('/')}
            className="bg-white text-primary border-2 border-primary px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-all"
          >
            Browse More Events
          </button>
        </div>
      </div>
    );
  }

  // Step 2c: Not found - show full registration form
  if (step === 'not-found') {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Complete Your Registration
          </h2>
          <p className="text-gray-600">
            We don't have your information on file. Please fill out the form below to register.
          </p>
        </div>

        <PublicRegistrationForm
          eventId={eventId}
          eventName={eventName}
          eventType={eventType}
          prefilledPhone={phone}
        />
      </div>
    );
  }

  return null;
}
