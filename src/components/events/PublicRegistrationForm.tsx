'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';

interface PublicRegistrationFormProps {
  eventId: string;
  eventName: string;
  eventType: string | null;
  prefilledPhone?: string;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  street: string;
  city: string;
  state: string;
  zip_code: string;
  employer: string;
  occupation: string;
}

export function PublicRegistrationForm({ eventId, eventName, eventType, prefilledPhone }: PublicRegistrationFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: prefilledPhone || '',
    date_of_birth: '',
    street: '',
    city: '',
    state: 'MO',
    zip_code: '',
    employer: '',
    occupation: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const supabase = createClient();
  const router = useRouter();

  // Check if event is a fundraiser
  const isFundraiser = eventType === 'fundraiser';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (cleanPhone.length !== 10) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (!formData.date_of_birth) {
      newErrors.date_of_birth = 'Date of birth is required';
    }

    // Address validation - conditional based on event type
    if (isFundraiser) {
      // For fundraisers, require full address
      if (!formData.street.trim()) {
        newErrors.street = 'Street address is required';
      }

      if (!formData.city.trim()) {
        newErrors.city = 'City is required';
      }

      if (!formData.state) {
        newErrors.state = 'State is required';
      }
    }

    // ZIP code is always required
    if (!formData.zip_code.trim()) {
      newErrors.zip_code = 'ZIP code is required';
    } else if (!/^\d{5}(-\d{4})?$/.test(formData.zip_code)) {
      newErrors.zip_code = 'Please enter a valid ZIP code';
    }

    // Employer is required for fundraisers
    if (isFundraiser && !formData.employer.trim()) {
      newErrors.employer = 'Employer is required for fundraiser events';
    }

    // Occupation is required for fundraisers
    if (isFundraiser && !formData.occupation.trim()) {
      newErrors.occupation = 'Occupation is required for fundraiser events';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Determine if they qualify as a member (under 36 AND living in MO)
      const age = calculateAge(formData.date_of_birth);
      const isEligibleMember = age < 36 && formData.state === 'MO';

      let memberId: string | null = null;

      // Step 1: Create member IF eligible
      if (isEligibleMember) {
        const { data: newMember, error: memberError } = await supabase
          .from('members')
          .insert({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            date_of_birth: formData.date_of_birth,
            address: `${formData.street}, ${formData.city}, ${formData.state} ${formData.zip_code}`,
            employer: formData.employer || null,
            industry: formData.occupation || null,
            date_joined: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
            referral_source: eventName,
          })
          .select()
          .single();

        if (memberError) {
          // Check if it's a duplicate email error
          if (memberError.code === '23505') {
            // Email already exists - try to get the existing member
            const { data: existingMember } = await supabase
              .from('members')
              .select('id')
              .eq('email', formData.email)
              .single();

            if (existingMember) {
              memberId = existingMember.id;
            }
          } else {
            throw memberError;
          }
        } else {
          memberId = newMember.id;
        }
      }

      // Step 2: ALWAYS create event_attendees record
      // Always populate guest fields (even when member_id exists)
      const { error: attendeeError } = await supabase
        .from('event_attendees')
        .insert({
          event_id: eventId,
          member_id: memberId, // Will be null for non-members
          guest_name: formData.name, // Always set
          guest_email: formData.email, // Always set
          guest_phone: formData.phone, // Always set
          date_of_birth: formData.date_of_birth,
          address: formData.street,
          city: formData.city,
          state: formData.state,
          zip: formData.zip_code,
          employer: formData.employer || null,
          occupation: formData.occupation || null,
          rsvp_status: 'attending',
          guest_count: 0,
          checked_in: false,
        });

      if (attendeeError) throw attendeeError;

      // Step 3: Show success
      setSuccess(true);
    } catch (err: any) {
      console.error('Registration error:', err);
      setError('An error occurred while registering. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Success state
  if (success) {
    return (
      <div className="text-center py-8">
        <div className="mb-8">
          <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-4 animate-fade-in" />
          <h3 className="text-3xl font-bold text-gray-900 mb-2">
            You're Registered!
          </h3>
          <p className="text-lg text-gray-600 mb-4">
            Thank you for registering, {formData.name}!
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
          Full Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-primary/20 transition-all ${
            errors.name ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-primary'
          }`}
          disabled={loading}
          placeholder=""
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
          Email Address *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-primary/20 transition-all ${
            errors.email ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-primary'
          }`}
          disabled={loading}
          placeholder=""
        />
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
          Phone Number *
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-primary/20 transition-all ${
            errors.phone ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-primary'
          }`}
          disabled={loading}
          placeholder=""
        />
        {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
      </div>

      {/* Date of Birth */}
      <div>
        <label htmlFor="date_of_birth" className="block text-sm font-semibold text-gray-700 mb-2">
          Date of Birth *
        </label>
        <input
          type="date"
          id="date_of_birth"
          name="date_of_birth"
          value={formData.date_of_birth}
          onChange={handleChange}
          className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-primary/20 transition-all ${
            errors.date_of_birth ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-primary'
          }`}
          disabled={loading}
          max={new Date().toISOString().split('T')[0]}
        />
        {errors.date_of_birth && <p className="mt-1 text-sm text-red-600">{errors.date_of_birth}</p>}
      </div>

      {/* Street Address */}
      <div>
        <label htmlFor="street" className="block text-sm font-semibold text-gray-700 mb-2">
          Street Address{isFundraiser ? ' *' : ''}
        </label>
        <input
          type="text"
          id="street"
          name="street"
          value={formData.street}
          onChange={handleChange}
          className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-primary/20 transition-all ${
            errors.street ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-primary'
          }`}
          disabled={loading}
          placeholder=""
        />
        {errors.street && <p className="mt-1 text-sm text-red-600">{errors.street}</p>}
      </div>

      {/* City, State, ZIP */}
      <div className="grid grid-cols-6 gap-4">
        <div className="col-span-3">
          <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-2">
            City{isFundraiser ? ' *' : ''}
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-primary/20 transition-all ${
              errors.city ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-primary'
            }`}
            disabled={loading}
            placeholder=""
          />
          {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
        </div>

        <div className="col-span-1">
          <label htmlFor="state" className="block text-sm font-semibold text-gray-700 mb-2">
            State{isFundraiser ? ' *' : ''}
          </label>
          <select
            id="state"
            name="state"
            value={formData.state}
            onChange={handleChange}
            className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-primary/20 transition-all ${
              errors.state ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-primary'
            }`}
            disabled={loading}
          >
            <option value="AL">AL</option>
            <option value="AK">AK</option>
            <option value="AZ">AZ</option>
            <option value="AR">AR</option>
            <option value="CA">CA</option>
            <option value="CO">CO</option>
            <option value="CT">CT</option>
            <option value="DE">DE</option>
            <option value="FL">FL</option>
            <option value="GA">GA</option>
            <option value="HI">HI</option>
            <option value="ID">ID</option>
            <option value="IL">IL</option>
            <option value="IN">IN</option>
            <option value="IA">IA</option>
            <option value="KS">KS</option>
            <option value="KY">KY</option>
            <option value="LA">LA</option>
            <option value="ME">ME</option>
            <option value="MD">MD</option>
            <option value="MA">MA</option>
            <option value="MI">MI</option>
            <option value="MN">MN</option>
            <option value="MS">MS</option>
            <option value="MO">MO</option>
            <option value="MT">MT</option>
            <option value="NE">NE</option>
            <option value="NV">NV</option>
            <option value="NH">NH</option>
            <option value="NJ">NJ</option>
            <option value="NM">NM</option>
            <option value="NY">NY</option>
            <option value="NC">NC</option>
            <option value="ND">ND</option>
            <option value="OH">OH</option>
            <option value="OK">OK</option>
            <option value="OR">OR</option>
            <option value="PA">PA</option>
            <option value="RI">RI</option>
            <option value="SC">SC</option>
            <option value="SD">SD</option>
            <option value="TN">TN</option>
            <option value="TX">TX</option>
            <option value="UT">UT</option>
            <option value="VT">VT</option>
            <option value="VA">VA</option>
            <option value="WA">WA</option>
            <option value="WV">WV</option>
            <option value="WI">WI</option>
            <option value="WY">WY</option>
          </select>
          {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state}</p>}
        </div>

        <div className="col-span-2">
          <label htmlFor="zip_code" className="block text-sm font-semibold text-gray-700 mb-2">
            ZIP Code *
          </label>
          <input
            type="text"
            id="zip_code"
            name="zip_code"
            value={formData.zip_code}
            onChange={handleChange}
            className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-primary/20 transition-all ${
              errors.zip_code ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-primary'
            }`}
            disabled={loading}
            placeholder=""
            maxLength={10}
          />
          {errors.zip_code && <p className="mt-1 text-sm text-red-600">{errors.zip_code}</p>}
        </div>
      </div>

      {/* Employer */}
      <div>
        <label htmlFor="employer" className="block text-sm font-semibold text-gray-700 mb-2">
          Employer{isFundraiser ? ' *' : ''}
        </label>
        <input
          type="text"
          id="employer"
          name="employer"
          value={formData.employer}
          onChange={handleChange}
          className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-primary/20 transition-all ${
            errors.employer ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-primary'
          }`}
          disabled={loading}
          placeholder=""
        />
        {errors.employer && <p className="mt-1 text-sm text-red-600">{errors.employer}</p>}
      </div>

      {/* Occupation - only show for fundraisers */}
      {isFundraiser && (
        <div>
          <label htmlFor="occupation" className="block text-sm font-semibold text-gray-700 mb-2">
            Occupation *
          </label>
          <input
            type="text"
            id="occupation"
            name="occupation"
            value={formData.occupation}
            onChange={handleChange}
            className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-primary/20 transition-all ${
              errors.occupation ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-primary'
            }`}
            disabled={loading}
            placeholder=""
          />
          {errors.occupation && <p className="mt-1 text-sm text-red-600">{errors.occupation}</p>}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary text-white py-4 rounded-lg font-semibold hover:opacity-90 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed mt-6"
      >
        {loading ? 'Registering...' : 'Complete Registration'}
      </button>
    </form>
  );
}
