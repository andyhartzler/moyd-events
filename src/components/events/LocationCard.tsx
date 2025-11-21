'use client';

import { MapPin } from 'lucide-react';

interface LocationCardProps {
  location: string;
  locationAddress?: string;
}

export function LocationCard({ location, locationAddress }: LocationCardProps) {
  const handleAddressClick = () => {
    const address = locationAddress || location;
    const encodedAddress = encodeURIComponent(address);

    // Detect device
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);

    let mapsUrl = '';

    if (isIOS) {
      // Apple Maps on iOS
      mapsUrl = `maps://maps.apple.com/?q=${encodedAddress}`;
    } else if (isAndroid) {
      // Google Maps on Android
      mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    } else {
      // Apple Maps on desktop (macOS)
      mapsUrl = `https://maps.apple.com/?q=${encodedAddress}`;
    }

    window.open(mapsUrl, '_blank');
  };

  // Create Google Maps embed URL for the iframe
  const address = locationAddress || location;
  const encodedAddress = encodeURIComponent(address);
  const embedUrl = `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodedAddress}`;

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-soft p-8">
      <h2 className="text-2xl font-bold text-[#273351] mb-4 flex items-center">
        <MapPin className="w-6 h-6 mr-3" />
        Location
      </h2>
      <div className="space-y-4">
        <div>
          <p className="text-lg font-semibold text-gray-900">{location}</p>
          {locationAddress && (
            <button
              onClick={handleAddressClick}
              className="text-blue-600 hover:text-blue-800 hover:underline transition-colors text-left mt-1"
            >
              {locationAddress}
            </button>
          )}
        </div>

        {/* Embedded Map */}
        <div className="w-full h-64 rounded-lg overflow-hidden border border-gray-200">
          <iframe
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps?q=${encodedAddress}&output=embed`}
          />
        </div>
      </div>
    </div>
  );
}
