'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';

export default function NewEventPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);

    const eventData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      event_date: formData.get('event_date') as string,
      event_end_date: formData.get('event_end_date') as string || null,
      location: formData.get('location') as string || null,
      location_address: formData.get('location_address') as string || null,
      event_type: formData.get('event_type') as string || null,
      rsvp_enabled: formData.get('rsvp_enabled') === 'on',
      rsvp_deadline: formData.get('rsvp_deadline') as string || null,
      max_attendees: formData.get('max_attendees') ? parseInt(formData.get('max_attendees') as string) : null,
      checkin_enabled: formData.get('checkin_enabled') === 'on',
      status: 'published' as const,
    };

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError('You must be logged in to create events');
      setLoading(false);
      return;
    }

    const { data, error: insertError } = await supabase
      .from('events')
      .insert([{ ...eventData, created_by: user.id }])
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push(`/events/${data.id}`);
  };

  return (
    <div className="py-8">
      <div className="container-custom mb-6">
        <Link
          href="/"
          className="inline-flex items-center text-white hover:opacity-70 font-medium transition-opacity"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Link>
      </div>

      <div className="container-custom">
        <div className="max-w-3xl mx-auto bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Create New Event</h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                Event Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Event Type */}
            <div>
              <label htmlFor="event_type" className="block text-sm font-semibold text-gray-700 mb-2">
                Event Type
              </label>
              <select
                id="event_type"
                name="event_type"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select type...</option>
                <option value="meeting">Meeting</option>
                <option value="rally">Rally</option>
                <option value="fundraiser">Fundraiser</option>
                <option value="social">Social</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Dates */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="event_date" className="block text-sm font-semibold text-gray-700 mb-2">
                  Start Date & Time *
                </label>
                <input
                  type="datetime-local"
                  id="event_date"
                  name="event_date"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="event_end_date" className="block text-sm font-semibold text-gray-700 mb-2">
                  End Date & Time
                </label>
                <input
                  type="datetime-local"
                  id="event_end_date"
                  name="event_end_date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-2">
                Location Name
              </label>
              <input
                type="text"
                id="location"
                name="location"
                placeholder="e.g., Community Center"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="location_address" className="block text-sm font-semibold text-gray-700 mb-2">
                Location Address
              </label>
              <input
                type="text"
                id="location_address"
                name="location_address"
                placeholder="123 Main St, City, State 12345"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* RSVP Settings */}
            <div className="border-t pt-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">RSVP Settings</h2>

              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="rsvp_enabled"
                    name="rsvp_enabled"
                    defaultChecked
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="rsvp_enabled" className="ml-2 text-sm font-medium text-gray-700">
                    Enable RSVP for this event
                  </label>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="rsvp_deadline" className="block text-sm font-semibold text-gray-700 mb-2">
                      RSVP Deadline
                    </label>
                    <input
                      type="datetime-local"
                      id="rsvp_deadline"
                      name="rsvp_deadline"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="max_attendees" className="block text-sm font-semibold text-gray-700 mb-2">
                      Max Attendees
                    </label>
                    <input
                      type="number"
                      id="max_attendees"
                      name="max_attendees"
                      min="1"
                      placeholder="No limit"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Check-in Settings */}
            <div className="border-t pt-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Check-in Settings</h2>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="checkin_enabled"
                  name="checkin_enabled"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="checkin_enabled" className="ml-2 text-sm font-medium text-gray-700">
                  Enable check-in for this event
                </label>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-6 border-t">
              <Button type="submit" disabled={loading} size="lg">
                {loading ? 'Creating...' : 'Create Event'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
                size="lg"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
