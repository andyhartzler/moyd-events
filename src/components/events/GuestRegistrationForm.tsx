'use client';

import { useState } from 'react';
import { UserPlus, ArrowLeft } from 'lucide-react';

interface GuestRegistrationFormProps {
  phoneNumber: string;
  onSubmit: (guestData: GuestData) => void;
  onBack: () => void;
  loading: boolean;
}

export interface GuestData {
  name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  occupation: string;
}

export function GuestRegistrationForm({ phoneNumber, onSubmit, onBack, loading }: GuestRegistrationFormProps) {
  const [formData, setFormData] = useState<GuestData>({
    name: '',
    email: '',
    phone: phoneNumber,
    date_of_birth: '',
    address: '',
    city: '',
    state: 'MO',
    zip_code: '',
    occupation: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof GuestData, string>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof GuestData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof GuestData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.date_of_birth) {
      newErrors.date_of_birth = 'Date of birth is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state) {
      newErrors.state = 'State is required';
    }

    if (!formData.zip_code.trim()) {
      newErrors.zip_code = 'ZIP code is required';
    } else if (!/^\d{5}(-\d{4})?$/.test(formData.zip_code)) {
      newErrors.zip_code = 'Please enter a valid ZIP code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div>
      <button
        onClick={onBack}
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        disabled={loading}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </button>

      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
          <UserPlus className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome to Missouri Young Democrats!
        </h2>
        <p className="text-gray-600">
          We don't have your information yet. Please fill out the form below to check in.
        </p>
      </div>

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
            placeholder="John Doe"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
            Email *
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
            placeholder="john@example.com"
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>

        {/* Phone (pre-filled) */}
        <div>
          <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50"
            disabled
          />
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

        {/* Address */}
        <div>
          <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">
            Street Address *
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-primary/20 transition-all ${
              errors.address ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-primary'
            }`}
            disabled={loading}
            placeholder="123 Main St"
          />
          {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
        </div>

        {/* City, State, ZIP */}
        <div className="grid grid-cols-6 gap-4">
          <div className="col-span-3">
            <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-2">
              City *
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
              placeholder="Kansas City"
            />
            {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
          </div>

          <div className="col-span-1">
            <label htmlFor="state" className="block text-sm font-semibold text-gray-700 mb-2">
              State *
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
              <option value="MO">MO</option>
              <option value="KS">KS</option>
              <option value="IL">IL</option>
              <option value="AR">AR</option>
              <option value="IA">IA</option>
              <option value="NE">NE</option>
              <option value="OK">OK</option>
              <option value="TN">TN</option>
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
              placeholder="64101"
              maxLength={10}
            />
            {errors.zip_code && <p className="mt-1 text-sm text-red-600">{errors.zip_code}</p>}
          </div>
        </div>

        {/* Occupation */}
        <div>
          <label htmlFor="occupation" className="block text-sm font-semibold text-gray-700 mb-2">
            Occupation
          </label>
          <input
            type="text"
            id="occupation"
            name="occupation"
            value={formData.occupation}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            disabled={loading}
            placeholder="Software Engineer"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="check-in-button w-full py-4 text-lg mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Checking in...' : 'Complete Check-In'}
        </button>
      </form>
    </div>
  );
}
