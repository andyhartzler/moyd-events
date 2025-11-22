'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';

export function SubscribeButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    date_of_birth: '',
  });

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Format phone to E.164 if provided
      let phone_e164 = null;
      if (formData.phone) {
        const digitsOnly = formData.phone.replace(/\D/g, '');
        if (digitsOnly.length === 10) {
          phone_e164 = `+1${digitsOnly}`;
        } else if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
          phone_e164 = `+${digitsOnly}`;
        }
      }

      const { error: insertError } = await supabase
        .from('subscribers')
        .insert({
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
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to subscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (success) {
    return (
      <div className="p-4 bg-green-600/20 border border-green-400/40 rounded-lg">
        <p className="text-sm text-green-200 font-medium text-center">
          Thanks for subscribing! You'll receive updates about our events.
        </p>
      </div>
    );
  }

  if (!isOpen) {
    return (
      <div>
        <Button
          onClick={() => setIsOpen(true)}
          variant="default"
          size="lg"
          className="w-full text-lg py-6 h-14"
        >
          Subscribe for Updates
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-soft p-5">
      <h3 className="text-xl font-bold text-[#273351] mb-4">Stay Updated on Our Events</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
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
            placeholder="John Doe"
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
            placeholder="john@example.com"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
            placeholder="(555) 555-5555"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
          />
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
            placeholder="123 Main St"
          />
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
              placeholder="Kansas City"
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
              <option value="">Select</option>
              <option value="MO">Missouri</option>
              <option value="KS">Kansas</option>
              <option value="IL">Illinois</option>
              <option value="AR">Arkansas</option>
              <option value="OK">Oklahoma</option>
              <option value="IA">Iowa</option>
              <option value="NE">Nebraska</option>
              <option value="TN">Tennessee</option>
              <option value="KY">Kentucky</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="zip_code" className="block text-sm font-medium text-gray-700 mb-1">
            ZIP Code <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="zip_code"
            name="zip_code"
            required
            value={formData.zip_code}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
            placeholder="64108"
            pattern="[0-9]{5}"
            maxLength={5}
          />
        </div>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Subscribing...' : 'Subscribe'}
          </Button>
        </div>
      </form>
    </div>
  );
}
