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

    const initMap = async () => {
      if (!mapRef.current || !window.mapkit) {
        setIsLoading(false);
        setError('MapKit not available');
        return;
      }

      try {
        const token = getMapKitToken();
        if (!token) {
          console.error('No MapKit token available for this domain');
          setError('No MapKit token available');
          setIsLoading(false);
          return;
        }

        // Initialize MapKit if not already initialized
        if (!window.mapkit.loadedLibraries || window.mapkit.loadedLibraries.length === 0) {
          window.mapkit.init({
            authorizationCallback: (done: any) => {
              done(token);
            }
          });

          // Wait for libraries to load
          await new Promise<void>((resolve) => {
            const checkLibraries = () => {
              if (window.mapkit.loadedLibraries && window.mapkit.loadedLibraries.length > 0) {
                resolve();
              } else {
                setTimeout(checkLibraries, 100);
              }
            };
            checkLibraries();
          });
        }

        if (!isMounted) return;

        // Geocode the address
        const geocoder = new window.mapkit.Geocoder({
          language: 'en-US',
        });

        const addressToGeocode = locationAddress || location;

        geocoder.lookup(addressToGeocode, (geocodeError: any, data: any) => {
          if (!isMounted) return;

          if (geocodeError) {
            console.error('Geocoding error:', geocodeError);
            setError('Unable to find location');
            setIsLoading(false);
            return;
          }

          if (data.results.length === 0) {
            console.error('No results found for address');
            setError('Location not found');
            setIsLoading(false);
            return;
          }

          const place = data.results[0];
          const coordinate = place.coordinate;

          // Create map
          const map = new window.mapkit.Map(mapRef.current, {
            center: new window.mapkit.Coordinate(coordinate.latitude, coordinate.longitude),
            zoom: 0.05,
            showsMapTypeControl: false,
            showsZoomControl: true,
            showsUserLocationControl: false,
            showsCompass: window.mapkit.FeatureVisibility.Hidden,
          });

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
          setIsLoading(false);
        });

      } catch (err) {
        console.error('MapKit initialization error:', err);
        setError('Failed to load map');
        setIsLoading(false);
      }
    };

    // Set up initialization
    if (window.mapkit) {
      initMap();
    } else {
      // Wait for MapKit script to load
      window.initMapKit = () => {
        initMap();
      };
    }

    return () => {
      isMounted = false;
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
