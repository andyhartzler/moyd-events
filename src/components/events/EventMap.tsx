'use client';

import { useEffect, useRef, useState } from 'react';
import { getMapKitToken } from '@/lib/utils/mapkit';

interface EventMapProps {
  location: string;
  locationAddress?: string | null;
  eventTitle: string;
}

export function EventMap({ location, locationAddress, eventTitle }: EventMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const initMap = async () => {
      console.log('[EventMap] initMap called');

      if (!mapRef.current) {
        console.error('[EventMap] mapRef.current is null');
        setIsLoading(false);
        setError('Map container not ready');
        return;
      }

      if (!window.mapkit) {
        console.error('[EventMap] window.mapkit not available');
        setIsLoading(false);
        setError('MapKit not loaded');
        return;
      }

      try {
        const token = getMapKitToken();
        console.log('[EventMap] Token available:', !!token);
        console.log('[EventMap] Hostname:', typeof window !== 'undefined' ? window.location.hostname : 'N/A');

        if (!token) {
          console.error('No MapKit token available for this domain');
          setError('No MapKit token available');
          setIsLoading(false);
          return;
        }

        // Initialize MapKit only once
        if (!window.mapkit._initialized) {
          console.log('[EventMap] Initializing MapKit...');
          window.mapkit.init({
            authorizationCallback: (done: any) => {
              console.log('[EventMap] Authorization callback called');
              done(token);
            }
          });
          window.mapkit._initialized = true;
        } else {
          console.log('[EventMap] MapKit already initialized');
        }

        if (!isMounted) return;

        console.log('[EventMap] Creating geocoder...');
        // Geocode the address
        const geocoder = new window.mapkit.Geocoder({
          language: 'en-US',
        });

        const addressToGeocode = locationAddress || location;
        console.log('[EventMap] Geocoding address:', addressToGeocode);

        geocoder.lookup(addressToGeocode, (geocodeError: any, data: any) => {
          console.log('[EventMap] Geocode callback received');

          if (!isMounted) return;

          if (geocodeError) {
            console.error('[EventMap] Geocoding error:', geocodeError);
            setError('Unable to find location');
            setIsLoading(false);
            return;
          }

          if (!data || data.results.length === 0) {
            console.error('[EventMap] No results found for address');
            setError('Location not found');
            setIsLoading(false);
            return;
          }

          const place = data.results[0];
          const coordinate = place.coordinate;
          console.log('[EventMap] Geocoded to:', coordinate);

          // Create map
          console.log('[EventMap] Creating map...');
          const coordinateRegion = new window.mapkit.CoordinateRegion(
            new window.mapkit.Coordinate(coordinate.latitude, coordinate.longitude),
            new window.mapkit.CoordinateSpan(0.01, 0.01)
          );

          const map = new window.mapkit.Map(mapRef.current, {
            region: coordinateRegion,
            showsMapTypeControl: false,
            showsZoomControl: true,
            showsUserLocationControl: false,
            showsCompass: window.mapkit.FeatureVisibility.Hidden,
          });

          console.log('[EventMap] Adding marker...');
          // Add marker
          const annotation = new window.mapkit.MarkerAnnotation(
            new window.mapkit.Coordinate(coordinate.latitude, coordinate.longitude),
            {
              title: eventTitle,
              subtitle: location,
              color: '#273351',
            }
          );

          map.addAnnotation(annotation);
          mapInstanceRef.current = map;
          console.log('[EventMap] Map initialization complete');
          setIsLoading(false);
        });

      } catch (err) {
        console.error('MapKit initialization error:', err);
        setError('Failed to load map');
        setIsLoading(false);
      }
    };

    // Set up initialization with timeout
    timeoutId = setTimeout(() => {
      if (isLoading && isMounted) {
        console.error('[EventMap] Initialization timeout');
        setError('Map loading timeout');
        setIsLoading(false);
      }
    }, 15000);

    // Poll for MapKit availability
    const pollForMapKit = () => {
      if (window.mapkit) {
        console.log('[EventMap] MapKit detected, initializing...');
        initMap();
      } else {
        console.log('[EventMap] Polling for MapKit...');
        const pollInterval = setInterval(() => {
          if (window.mapkit) {
            console.log('[EventMap] MapKit now available');
            clearInterval(pollInterval);
            initMap();
          }
        }, 200);

        // Store interval for cleanup
        return () => clearInterval(pollInterval);
      }
    };

    const cleanupPoll = pollForMapKit();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      if (cleanupPoll) cleanupPoll();
      // Cleanup
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.destroy();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, [location, locationAddress, eventTitle]);

  if (error) {
    return (
      <div className="w-full h-[400px] rounded-xl overflow-hidden shadow-lg bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[400px]">
      {isLoading && (
        <div className="absolute inset-0 rounded-xl bg-gray-100 flex items-center justify-center z-10">
          <div className="text-gray-600">Loading map...</div>
        </div>
      )}
      <div
        ref={mapRef}
        className="w-full h-full rounded-xl overflow-hidden shadow-lg"
        style={{ minHeight: '400px' }}
      />
    </div>
  );
}
