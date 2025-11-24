'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getMapKitToken } from '@/lib/utils/mapkit';
import { Loader2, MapPin, Upload } from 'lucide-react';

type LocationSuggestion = {
  title: string;
  subtitle?: string;
  address: string;
};

type LocationKey = 'primary' | 'secondary' | 'tertiary';

const locationFieldMap: Record<
  LocationKey,
  { nameKey: keyof EventForm['event']; addressKey: keyof EventForm['event'] }
> = {
  primary: { nameKey: 'location_name', addressKey: 'location_address' },
  secondary: { nameKey: 'location_two_name', addressKey: 'location_two_address' },
  tertiary: { nameKey: 'location_three_name', addressKey: 'location_three_address' },
};

interface EventForm {
  event: {
    title: string;
    description: string;
    event_date: string;
    event_end_date: string;
    event_type: string;
    location_name: string;
    location_address: string;
    location_two_name: string;
    location_two_address: string;
    location_three_name: string;
    location_three_address: string;
    multiple_locations: boolean;
  };
  submitter: {
    phone: string;
    name: string;
    email: string;
    date_of_birth: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    employer: string;
    occupation: string;
  };
}

export function CreateEventForm() {
  const supabase = useMemo(() => createClient(), []);

  const [formData, setFormData] = useState<EventForm>({
    event: {
      title: '',
      description: '',
      event_date: '',
      event_end_date: '',
      event_type: '',
      location_name: '',
      location_address: '',
      location_two_name: '',
      location_two_address: '',
      location_three_name: '',
      location_three_address: '',
      multiple_locations: false,
    },
    submitter: {
      phone: '',
      name: '',
      email: '',
      date_of_birth: '',
      street: '',
      city: '',
      state: 'MO',
      zip: '',
      employer: '',
      occupation: '',
    },
  });

  const [memberId, setMemberId] = useState<string | null>(null);
  const [createdById, setCreatedById] = useState<string | null>(null);
  const [lookupStatus, setLookupStatus] = useState<'idle' | 'loading' | 'found' | 'not-found'>('idle');
  const [lookupAttempted, setLookupAttempted] = useState(false);

  const [suggestions, setSuggestions] = useState<Record<LocationKey, LocationSuggestion[]>>({
    primary: [],
    secondary: [],
    tertiary: [],
  });
  const searchAutocomplete = useRef<any>(null);
  const [mapkitReady, setMapkitReady] = useState(false);

  const [fileUpload, setFileUpload] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [websiteImage, setWebsiteImage] = useState<any | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const initializeMapkit = () => {
      if (typeof window === 'undefined' || !('mapkit' in window)) return;
      if (!window.mapkit?._initialized) {
        const token = getMapKitToken();
        if (!token) return;

        window.mapkit.init({
          authorizationCallback: (done: (token: string) => void) => done(token),
          language: 'en',
        });
        window.mapkit._initialized = true;
      }

      searchAutocomplete.current = new window.mapkit.SearchAutocomplete();
      setMapkitReady(true);
      clearInterval(interval);
    };

    interval = setInterval(initializeMapkit, 400);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const stripCountry = (address: string) => {
    return address.replace(/,?\s*United States$/i, '').trim();
  };

  const handleEventChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      event: {
        ...prev.event,
        [name]: type === 'checkbox' ? checked : value,
      },
    }));
  };

  const handleSubmitterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      submitter: {
        ...prev.submitter,
        [name]: value,
      },
    }));
  };

  const handleLocationSearch = (key: LocationKey, value: string) => {
    handleEventChange({ target: { name: locationFieldMap[key].nameKey, value } } as any);

    if (!mapkitReady || !searchAutocomplete.current || !value) {
      setSuggestions(prev => ({ ...prev, [key]: [] }));
      return;
    }

    searchAutocomplete.current.search(value, (error: any, data: any) => {
      if (error || !data?.results) return;
      const mapped = data.results.slice(0, 5).map((result: any) => {
        const displayLines = result.displayLines || [];
        const formatted = stripCountry(displayLines.join(', '));
        return {
          title: result.title || value,
          subtitle: result.subtitle,
          address: formatted || value,
        } as LocationSuggestion;
      });
      setSuggestions(prev => ({ ...prev, [key]: mapped }));
    });
  };

  const handleSuggestionSelect = (key: LocationKey, suggestion: LocationSuggestion) => {
    setFormData(prev => ({
      ...prev,
      event: {
        ...prev.event,
        [locationFieldMap[key].nameKey]: suggestion.title,
        [locationFieldMap[key].addressKey]: suggestion.address,
      },
    }));
    setSuggestions(prev => ({ ...prev, [key]: [] }));
  };

  const handleLookup = async () => {
    if (!formData.submitter.phone) return;

    setLookupAttempted(true);
    setLookupStatus('loading');

    try {
      const response = await fetch('https://faajpcarasilbfndzkmd.supabase.co/functions/v1/rsvp-by-phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: formData.submitter.phone }),
      });

      const data = await response.json();

      if (data?.found) {
        setLookupStatus('found');
        setMemberId(data.member_id || data.memberId || null);
        setCreatedById(data.uuid || data.user_id || data.userId || null);

        const userDetails = data.user || data;
        setFormData(prev => ({
          ...prev,
          submitter: {
            ...prev.submitter,
            name: userDetails.name || prev.submitter.name,
            email: userDetails.email || prev.submitter.email,
            phone: formData.submitter.phone,
            date_of_birth: userDetails.date_of_birth || userDetails.dateOfBirth || prev.submitter.date_of_birth,
            street: userDetails.address || prev.submitter.street,
            city: userDetails.city || prev.submitter.city,
            state: userDetails.state || prev.submitter.state,
            zip: userDetails.zip || userDetails.zip_code || prev.submitter.zip,
            employer: userDetails.employer || prev.submitter.employer,
            occupation: userDetails.occupation || prev.submitter.occupation,
          },
        }));
      } else {
        setLookupStatus('not-found');
      }
    } catch (error) {
      console.error('Lookup error', error);
      setLookupStatus('not-found');
    }
  };

  const uploadWebsiteImage = async () => {
    if (!fileUpload) return null;
    setUploadingImage(true);
    const filePath = `event-submissions/${Date.now()}-${fileUpload.name}`;

    const { error: uploadError } = await supabase.storage.from('events').upload(filePath, fileUpload);
    if (uploadError) {
      throw uploadError;
    }

    const { data: publicUrlData } = supabase.storage.from('events').getPublicUrl(filePath);

    const metadata = {
      file_name: fileUpload.name,
      storage_url: publicUrlData?.publicUrl || '',
      uploaded_at: new Date().toISOString(),
      content_type: fileUpload.type,
      storage_path: filePath,
      storage_bucket: 'events',
    };

    setWebsiteImage(metadata);
    setUploadingImage(false);
    return metadata;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!formData.event.title.trim() || !formData.event.event_date) {
      setErrorMessage('Please provide at least an event title and start date.');
      return;
    }

    if (!lookupAttempted) {
      setErrorMessage('Please verify your phone number before submitting.');
      return;
    }

    setSubmitting(true);

    try {
      let imageMetadata = websiteImage;
      if (fileUpload && !websiteImage) {
        imageMetadata = await uploadWebsiteImage();
      }

      const isMultiple = formData.event.multiple_locations;
      const submissionTimestamp = new Date();
      const notes = `Submitted by ${formData.submitter.name || 'Unknown'} on ${submissionTimestamp.toLocaleString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })} via the public Events website.`;

      const { data: newEvent, error: eventError } = await supabase
        .from('events')
        .insert({
          title: formData.event.title,
          description: formData.event.description || null,
          event_date: new Date(formData.event.event_date).toISOString(),
          event_end_date: formData.event.event_end_date ? new Date(formData.event.event_end_date).toISOString() : null,
          event_type: formData.event.event_type || null,
          location: isMultiple ? null : formData.event.location_name || null,
          location_address: isMultiple ? null : formData.event.location_address || null,
          location_one_name: isMultiple ? formData.event.location_name || null : null,
          location_one_address: isMultiple ? formData.event.location_address || null : null,
          location_two_name: isMultiple ? formData.event.location_two_name || null : null,
          location_two_address: isMultiple ? formData.event.location_two_address || null : null,
          location_three_name: isMultiple ? formData.event.location_three_name || null : null,
          location_three_address: isMultiple ? formData.event.location_three_address || null : null,
          multiple_locations: isMultiple,
          rsvp_enabled: true,
          checkin_enabled: false,
          status: 'draft',
          hide_address_before_rsvp: false,
          created_by: createdById,
          notes,
          website_image: imageMetadata,
        })
        .select()
        .single();

      if (eventError || !newEvent) {
        throw eventError || new Error('Unable to create event');
      }

      const { error: attendeeError } = await supabase.from('event_attendees').insert({
        event_id: newEvent.id,
        member_id: memberId,
        guest_name: formData.submitter.name || null,
        guest_email: formData.submitter.email || null,
        guest_phone: formData.submitter.phone,
        date_of_birth: formData.submitter.date_of_birth || null,
        address: formData.submitter.street || null,
        city: formData.submitter.city || null,
        state: formData.submitter.state || null,
        zip: formData.submitter.zip || null,
        employer: formData.submitter.employer || null,
        occupation: formData.submitter.occupation || null,
        rsvp_status: 'attending',
        guest_count: 0,
        notes: 'Event submitter',
      });

      if (attendeeError) {
        throw attendeeError;
      }

      setSuccessMessage('Your event was saved as a draft! We will review the details soon.');
      setFormData(prev => ({
        event: {
          ...prev.event,
          title: '',
          description: '',
          event_date: '',
          event_end_date: '',
          event_type: '',
          location_name: '',
          location_address: '',
          location_two_name: '',
          location_two_address: '',
          location_three_name: '',
          location_three_address: '',
          multiple_locations: false,
        },
        submitter: {
          phone: '',
          name: '',
          email: '',
          date_of_birth: '',
          street: '',
          city: '',
          state: 'MO',
          zip: '',
          employer: '',
          occupation: '',
        },
      }));
      setLookupAttempted(false);
      setLookupStatus('idle');
      setMemberId(null);
      setCreatedById(null);
      setWebsiteImage(null);
      setFileUpload(null);
    } catch (error: any) {
      console.error('Event submission error', error);
      setErrorMessage('Something went wrong while submitting your event. Please try again.');
    } finally {
      setSubmitting(false);
      setUploadingImage(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Event details</h2>
          <p className="text-gray-600">Provide the information we need to publish your event.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Event title *</label>
            <input
              type="text"
              name="title"
              value={formData.event.title}
              onChange={handleEventChange}
              required
              className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="e.g. Community Meet & Greet"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Event type</label>
            <input
              type="text"
              name="event_type"
              value={formData.event.event_type}
              onChange={handleEventChange}
              className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Fundraiser, Rally, Social..."
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Description</label>
          <textarea
            name="description"
            value={formData.event.description}
            onChange={handleEventChange}
            rows={4}
            className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder="Share the agenda, speakers, and any details guests should know."
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Start date & time *</label>
            <input
              type="datetime-local"
              name="event_date"
              value={formData.event.event_date}
              onChange={handleEventChange}
              required
              className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">End date & time</label>
            <input
              type="datetime-local"
              name="event_end_date"
              value={formData.event.event_end_date}
              onChange={handleEventChange}
              className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            id="multiple_locations"
            type="checkbox"
            name="multiple_locations"
            checked={formData.event.multiple_locations}
            onChange={handleEventChange}
            className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <label htmlFor="multiple_locations" className="text-sm font-semibold text-gray-700">
            This event has multiple locations
          </label>
        </div>

        <div className="space-y-6">
          {(['primary', 'secondary', 'tertiary'] as LocationKey[]).map(key => {
            const { nameKey, addressKey } = locationFieldMap[key];
            const isPrimary = key === 'primary';
            const showField = isPrimary || formData.event.multiple_locations;

            if (!showField) return null;

            return (
              <div key={key} className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2 relative">
                  <label className="block text-sm font-semibold text-gray-700">
                    {isPrimary ? 'Location name' : `Location ${key === 'secondary' ? '2' : '3'} name`}
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name={nameKey as string}
                      value={formData.event[nameKey] as string}
                      onChange={e => handleLocationSearch(key, e.target.value)}
                      placeholder="Search location"
                      className="w-full rounded-lg border-2 border-gray-200 px-10 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  {suggestions[key].length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                      {suggestions[key].map((suggestion, idx) => (
                        <button
                          key={`${suggestion.title}-${idx}`}
                          type="button"
                          onClick={() => handleSuggestionSelect(key, suggestion)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50"
                        >
                          <div className="font-semibold text-gray-900">{suggestion.title}</div>
                          <div className="text-sm text-gray-600">{suggestion.address}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    {isPrimary ? 'Location address' : `Location ${key === 'secondary' ? '2' : '3'} address`}
                  </label>
                  <input
                    type="text"
                    name={addressKey as string}
                    value={formData.event[addressKey] as string}
                    onChange={handleEventChange}
                    placeholder="123 Main St, City, ST"
                    className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Event graphic</label>
          <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
            <label className="inline-flex items-center gap-2 px-4 py-3 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:text-primary">
              <Upload className="w-5 h-5" />
              <span className="font-semibold">Upload image</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => setFileUpload(e.target.files?.[0] || null)}
              />
            </label>
            {fileUpload && <span className="text-sm text-gray-700">{fileUpload.name}</span>}
          </div>
          <p className="text-sm text-gray-500">We&rsquo;ll store this in our events bucket and attach it to your draft.</p>
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Your information</h2>
          <p className="text-gray-600">Start with your phone number so we can find you in our system.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-2 space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Phone number *</label>
            <input
              type="tel"
              name="phone"
              value={formData.submitter.phone}
              onChange={handleSubmitterChange}
              required
              className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="(555) 123-4567"
            />
          </div>
          <button
            type="button"
            onClick={handleLookup}
            disabled={lookupStatus === 'loading' || !formData.submitter.phone}
            className="inline-flex justify-center items-center px-4 py-3 bg-primary text-white rounded-lg font-semibold shadow-md hover:opacity-90 disabled:opacity-60"
          >
            {lookupStatus === 'loading' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Checking
              </>
            ) : (
              'Lookup phone'
            )}
          </button>
        </div>

        {(lookupAttempted || lookupStatus === 'found') && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Full name *</label>
              <input
                type="text"
                name="name"
                value={formData.submitter.name}
                onChange={handleSubmitterChange}
                required
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.submitter.email}
                onChange={handleSubmitterChange}
                required
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Date of birth</label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.submitter.date_of_birth}
                onChange={handleSubmitterChange}
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Street address</label>
              <input
                type="text"
                name="street"
                value={formData.submitter.street}
                onChange={handleSubmitterChange}
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">City</label>
              <input
                type="text"
                name="city"
                value={formData.submitter.city}
                onChange={handleSubmitterChange}
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.submitter.state}
                  onChange={handleSubmitterChange}
                  className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">ZIP</label>
                <input
                  type="text"
                  name="zip"
                  value={formData.submitter.zip}
                  onChange={handleSubmitterChange}
                  className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Employer</label>
              <input
                type="text"
                name="employer"
                value={formData.submitter.employer}
                onChange={handleSubmitterChange}
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Occupation</label>
              <input
                type="text"
                name="occupation"
                value={formData.submitter.occupation}
                onChange={handleSubmitterChange}
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        )}
      </section>

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">{errorMessage}</div>
      )}
      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg">{successMessage}</div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting || uploadingImage}
          className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white rounded-lg font-semibold shadow-md hover:opacity-90 disabled:opacity-60"
        >
          {(submitting || uploadingImage) && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
          Submit event draft
        </button>
      </div>
    </form>
  );
}
