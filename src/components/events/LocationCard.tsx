'use client';

import { MapPin } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface LocationCardProps {
  location: string;
  locationAddress?: string;
}

export function LocationCard({ location, locationAddress }: LocationCardProps) {
  const mapRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    // Load MapKit JS script for Apple Maps embed
    const script = document.createElement('script');
    script.src = 'https://cdn.apple-mapkit.com/mk/5.x.x/mapkit.core.js';
    script.crossOrigin = 'anonymous';
    script.dataset.callback = 'initMapKit';
    script.dataset.libraries = 'map';

    // TODO: Replace with your MapKit JS token from Apple Developer Portal
    // Get it from: https://developer.apple.com/documentation/mapkitjs
    const MAPKIT_TOKEN = process.env.NEXT_PUBLIC_APPLE_MAPKIT_TOKEN || '';

    (window as any).initMapKit = () => {
      if (!mapRef.current) return;

      try {
        // Initialize MapKit JS
        (window as any).mapkit.init({
          authorizationCallback: (done: any) => {
            done(MAPKIT_TOKEN);
          }
        });

        // Create map
        const map = new (window as any).mapkit.Map(mapRef.current, {
          center: new (window as any).mapkit.Coordinate(38.5767, -92.1736), // Missouri center
          showsUserLocation: false,
          showsCompass: (window as any).mapkit.FeatureVisibility.Hidden,
        });

        // Geocode address and add marker
        const geocoder = new (window as any).mapkit.Geocoder();
        const address = locationAddress || location;

        geocoder.lookup(address, (error: any, data: any) => {
          if (!error && data.results.length > 0) {
            const place = data.results[0];
            const coordinate = place.coordinate;

            // Center map on location
            map.setCenterAnimated(coordinate);
            map.region = new (window as any).mapkit.CoordinateRegion(
              coordinate,
              new (window as any).mapkit.CoordinateSpan(0.02, 0.02)
            );

            // Add marker
            const annotation = new (window as any).mapkit.MarkerAnnotation(coordinate, {
              title: location,
              subtitle: locationAddress,
              color: '#273351',
            });
            map.addAnnotation(annotation);
          }
        });
      } catch (err) {
        console.error('MapKit JS initialization error:', err);
      }
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [location, locationAddress]);

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

        {/* Embedded Apple Map */}
        <div
          ref={mapRef}
          className="w-full h-64 rounded-lg overflow-hidden border border-gray-200 bg-gray-100"
          style={{ minHeight: '256px' }}
        />
      </div>
    </div>
  );
}
