'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import { MapPin } from 'lucide-react';

interface FormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  date_of_birth: string;
}

const initialFormData: FormData = {
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zip_code: '',
  date_of_birth: '',
};

type LocationSuggestion = {
  title: string;
  address: string;
  placeId?: string;
};

export default function SubscribePage() {
  const supabase = createClient();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successName, setSuccessName] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);

  const googlePlacesReady = useRef(false);
  const googleScriptLoading = useRef(false);
  const autocompleteService = useRef<any>(null);
  const placesService = useRef<any>(null);

  useEffect(() => {
    const initializeGooglePlaces = () => {
      if (typeof window === 'undefined') return;

      const google = (window as any).google;
      if (google?.maps?.places) {
        autocompleteService.current = new google.maps.places.AutocompleteService();
        placesService.current = new google.maps.places.PlacesService(document.createElement('div'));
        googlePlacesReady.current = true;
        return true;
      }

      return false;
    };

    if (initializeGooglePlaces()) return;

    if (googleScriptLoading.current) return;
    googleScriptLoading.current = true;

    const existingScript = document.querySelector('script[data-google-places]') as HTMLScriptElement | null;

    const script = existingScript || document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyCM0aqoZkzdjfrMNezyDGFqGMaf7gK4z8Y'
    }&libraries=places`;
    script.async = true;
    script.defer = true;
    script.dataset.googlePlaces = 'true';
    script.onload = () => initializeGooglePlaces();
    script.onerror = () => {
      googlePlacesReady.current = false;
      googleScriptLoading.current = false;
      console.error('Failed to load Google Places library');
    };

    if (!existingScript) {
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (successName && typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [successName]);

  const stripCountry = (address: string) => address.replace(/,?\s*United States$/i, '').trim();

  const parseAddressComponents = (components: any[] = []) => {
    const getComponent = (type: string) => components.find(component => component.types?.includes(type));

    const streetNumber = getComponent('street_number')?.long_name || '';
    const route = getComponent('route')?.long_name || '';
    const city =
      getComponent('locality')?.long_name ||
      getComponent('sublocality')?.long_name ||
      getComponent('administrative_area_level_3')?.long_name ||
      getComponent('administrative_area_level_2')?.long_name ||
      '';
    const state = getComponent('administrative_area_level_1')?.short_name || '';
    const zip = getComponent('postal_code')?.long_name || '';

    const street = [streetNumber, route].filter(Boolean).join(' ').trim();

    return { street, city, state, zip };
  };

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);

    const area = digits.slice(0, 3);
    const prefix = digits.slice(3, 6);
    const line = digits.slice(6, 10);

    if (digits.length <= 3) return area ? `(${area}` : '';
    if (digits.length <= 6) return `(${area}) ${prefix}`;
    return `(${area}) ${prefix}-${line}`;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      const formatted = formatPhoneNumber(value);
      setFormData(prev => ({
        ...prev,
        phone: formatted,
      }));
      return;
    }

    if (name === 'address') {
      handleAddressInput(value);
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddressInput = (value: string) => {
    setFormData(prev => ({ ...prev, address: value }));

    if (!googlePlacesReady.current || !autocompleteService.current || !value) {
      setSuggestions([]);
      return;
    }

    autocompleteService.current.getPlacePredictions(
      {
        input: value,
        componentRestrictions: { country: 'us' },
      },
      (predictions: any[] = [], status: string) => {
        if (status !== 'OK' || !predictions?.length) {
          setSuggestions([]);
          return;
        }

        const mapped = predictions.slice(0, 5).map(prediction => ({
          title: prediction.structured_formatting?.main_text || prediction.description || value,
          address: stripCountry(prediction.description || value),
          placeId: prediction.place_id,
        }));

        setSuggestions(mapped);
      }
    );
  };

  const handleSuggestionSelect = (suggestion: LocationSuggestion) => {
    const google = (typeof window !== 'undefined' ? (window as any).google : null) as any;

    const finalize = (street: string, city?: string, state?: string, zip?: string) => {
      setFormData(prev => ({
        ...prev,
        address: street || prev.address,
        city: city || prev.city,
        state: state || prev.state,
        zip_code: zip || prev.zip_code,
      }));
      setSuggestions([]);
    };

    if (google && placesService.current && suggestion.placeId) {
      placesService.current.getDetails(
        {
          placeId: suggestion.placeId,
          fields: ['formatted_address', 'address_components'],
        },
        (place: any, status: string) => {
          if (status === 'OK' && place) {
            const { street, city, state, zip } = parseAddressComponents(place.address_components || []);
            const streetValue = street || stripCountry(place.formatted_address || suggestion.address);
            finalize(streetValue, city, state, zip);
            return;
          }

          finalize(suggestion.address, undefined, undefined, undefined);
        }
      );
      return;
    }

    finalize(suggestion.address, undefined, undefined, undefined);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const digitsOnly = formData.phone.replace(/\D/g, '');
      if (digitsOnly.length !== 10) {
        setError('Please enter a valid 10-digit phone number.');
        return;
      }

      let phone_e164 = null;
      if (digitsOnly.length === 10) {
        phone_e164 = `+1${digitsOnly}`;
      }

      const { error: insertError } = await supabase.from('subscribers').insert({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        phone_e164,
        address: formData.address || null,
        city: formData.city || null,
        state: formData.state || null,
        zip_code: formData.zip_code || null,
        date_of_birth: formData.date_of_birth || null,
        source: 'events-website',
        subscription_status: 'subscribed',
        optin_date: new Date().toISOString(),
      });

      if (insertError) {
        if (insertError.code === '23505') {
          setError('This email is already subscribed!');
        } else {
          throw insertError;
        }
      } else {
        setSuccessName(formData.name.trim() || null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to subscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const thanksName = successName || formData.name.trim();

  return (
    <div className="min-h-screen py-10 px-4 flex">
      <div className="container-custom max-w-2xl mx-auto space-y-6 flex-1 flex flex-col">
        <Link
          href="/"
          className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all"
          aria-label="Back to Events"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg flex-1 flex flex-col justify-center">
          {successName ? (
            <div className="text-center space-y-4">
              <h1 className="text-3xl font-bold text-gray-900">
                Thanks for subscribing{thanksName ? `, ${thanksName}!` : '!'}
              </h1>
              <p className="text-gray-700">
                You'll be the first to hear about upcoming events and updates.
              </p>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 bg-primary text-white hover:bg-primary-700 px-6 py-3 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
              >
                Return to Events
              </Link>
            </div>
            ) : (
            <div className="space-y-6">
              <div className="text-center md:text-left flex flex-col items-center md:items-start">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Stay Up To Date on Future Events
                </h1>
                <p className="text-gray-600">
                  Join our list to get invitations and updates about upcoming events.
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    maxLength={14}
                    inputMode="tel"
                    autoComplete="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
                  />
                </div>

                <div>
                  <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="date_of_birth"
                    name="date_of_birth"
                    required
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 box-border"
                    style={{ maxWidth: '100%' }}
                  />
                </div>

                <div className="relative">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Start typing to search your address"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
                    />
                  </div>
                  {suggestions.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                      {suggestions.map((suggestion, idx) => (
                        <button
                          key={`${suggestion.title}-${idx}`}
                          type="button"
                          onClick={() => handleSuggestionSelect(suggestion)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50"
                        >
                          <div className="font-semibold text-gray-900">{suggestion.title}</div>
                          <div className="text-sm text-gray-600">{suggestion.address}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <select
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
                    >
                      <option value="">Select a state</option>
                      <option value="AL">Alabama</option>
                      <option value="AK">Alaska</option>
                      <option value="AZ">Arizona</option>
                      <option value="AR">Arkansas</option>
                      <option value="CA">California</option>
                      <option value="CO">Colorado</option>
                      <option value="CT">Connecticut</option>
                      <option value="DE">Delaware</option>
                      <option value="FL">Florida</option>
                      <option value="GA">Georgia</option>
                      <option value="HI">Hawaii</option>
                      <option value="ID">Idaho</option>
                      <option value="IL">Illinois</option>
                      <option value="IN">Indiana</option>
                      <option value="IA">Iowa</option>
                      <option value="KS">Kansas</option>
                      <option value="KY">Kentucky</option>
                      <option value="LA">Louisiana</option>
                      <option value="ME">Maine</option>
                      <option value="MD">Maryland</option>
                      <option value="MA">Massachusetts</option>
                      <option value="MI">Michigan</option>
                      <option value="MN">Minnesota</option>
                      <option value="MS">Mississippi</option>
                      <option value="MO">Missouri</option>
                      <option value="MT">Montana</option>
                      <option value="NE">Nebraska</option>
                      <option value="NV">Nevada</option>
                      <option value="NH">New Hampshire</option>
                      <option value="NJ">New Jersey</option>
                      <option value="NM">New Mexico</option>
                      <option value="NY">New York</option>
                      <option value="NC">North Carolina</option>
                      <option value="ND">North Dakota</option>
                      <option value="OH">Ohio</option>
                      <option value="OK">Oklahoma</option>
                      <option value="OR">Oregon</option>
                      <option value="PA">Pennsylvania</option>
                      <option value="RI">Rhode Island</option>
                      <option value="SC">South Carolina</option>
                      <option value="SD">South Dakota</option>
                      <option value="TN">Tennessee</option>
                      <option value="TX">Texas</option>
                      <option value="UT">Utah</option>
                      <option value="VT">Vermont</option>
                      <option value="VA">Virginia</option>
                      <option value="WA">Washington</option>
                      <option value="WV">West Virginia</option>
                      <option value="WI">Wisconsin</option>
                      <option value="WY">Wyoming</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="zip_code" className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    id="zip_code"
                    name="zip_code"
                    value={formData.zip_code}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="default"
                    size="lg"
                    disabled={loading}
                    className="w-full px-8 py-3 text-lg"
                  >
                    {loading ? 'Submitting...' : 'Subscribe'}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
