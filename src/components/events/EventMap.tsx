'use client';

import { useEffect, useRef } from 'react';
import { getMapKitToken } from '@/lib/utils/mapkit';

interface EventMapProps {
  location: string;
  locationAddress?: string | null;
  eventTitle: string;
}

export function EventMap({ location, locationAddress, eventTitle }: EventMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    // Wait for MapKit to load
    const initMap = () => {
      if (!mapRef.current || !window.mapkit) return;

      try {
        const token = getMapKitToken();
        if (!token) {
          console.error('No MapKit token available for this domain');
          return;
        }

        // Initialize MapKit
        window.mapkit.init({
          authorizationCallback: (done: any) => {
            done(token);
          }
        });

        // Geocode the address
        const geocoder = new window.mapkit.Geocoder({
          language: 'en-US',
        });

        const addressToGeocode = locationAddress || location;

        geocoder.lookup(addressToGeocode, (error: any, data: any) => {
          if (error) {
            console.error('Geocoding error:', error);
            return;
          }

          if (data.results.length === 0) {
            console.error('No results found for address');
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
        });

      } catch (err) {
        console.error('MapKit initialization error:', err);
      }
    };

    // Check if MapKit is already loaded
    if (window.mapkit && window.mapkit.loadedLibraries) {
      initMap();
    } else {
      // Wait for MapKit to load
      window.initMapKit = initMap;
    }

    return () => {
      // Cleanup
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
      }
    };
  }, [location, locationAddress, eventTitle]);

  return (
    <div
      ref={mapRef}
      className="w-full h-[400px] rounded-xl overflow-hidden shadow-lg"
      style={{ minHeight: '400px' }}
    />
  );
}
