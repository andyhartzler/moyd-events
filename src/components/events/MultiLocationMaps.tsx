"use client";

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Lock, MapPin } from 'lucide-react';

import { EventMap } from './EventMap';

interface LocationInfo {
  name: string;
  address: string | null;
}

interface MultiLocationMapsProps {
  locations: LocationInfo[];
  shouldHideAddress: boolean;
  eventTitle: string;
  eventSlug: string;
  isEventPast: boolean;
  posterElementId?: string;
}

const GAP_BETWEEN_TILES = 16; // Tailwind gap-4
const MIN_TILE_HEIGHT = 120;

export function MultiLocationMaps({
  locations,
  shouldHideAddress,
  eventTitle,
  eventSlug,
  isEventPast,
  posterElementId = 'event-poster-card',
}: MultiLocationMapsProps) {
  const [calculatedHeight, setCalculatedHeight] = useState<number | null>(null);

  const fallbackHeight = useMemo(() => {
    const count = locations.length;
    if (count <= 1) return 200;
    if (count === 2) return 150;
    return 125;
  }, [locations.length]);

  useEffect(() => {
    const computeHeight = () => {
      const poster = document.getElementById(posterElementId);
      if (!poster || locations.length === 0) {
        setCalculatedHeight(null);
        return;
      }

      const posterHeight = poster.getBoundingClientRect().height;
      if (!posterHeight || posterHeight <= 0) {
        setCalculatedHeight(null);
        return;
      }

      const totalGap = GAP_BETWEEN_TILES * (locations.length - 1);
      const available = posterHeight - totalGap;
      if (available <= 0) {
        setCalculatedHeight(null);
        return;
      }

      const perTile = available / locations.length;
      setCalculatedHeight(Math.max(MIN_TILE_HEIGHT, perTile));
    };

    computeHeight();

    const resizeTarget: any = typeof window !== 'undefined' ? window : null;

    if (!resizeTarget) return undefined;

    if ('ResizeObserver' in resizeTarget) {
      const observer = new ResizeObserver(() => computeHeight());
      const poster = document.getElementById(posterElementId);
      if (poster) observer.observe(poster);
      return () => observer.disconnect();
    }

    resizeTarget.addEventListener('resize', computeHeight);
    return () => resizeTarget.removeEventListener('resize', computeHeight);
  }, [locations.length, posterElementId]);

  const mapHeight = calculatedHeight ?? fallbackHeight;

  return (
    <div className="flex flex-col gap-4 lg:h-full">
      {locations.map((loc, index) => (
        <div
          key={`${loc.name}-${index}`}
          className="bg-white/80 backdrop-blur-sm rounded-xl shadow-soft p-4"
        >
          <h2 className="text-lg font-bold text-[#273351] mb-2 flex items-center">
            <MapPin className="w-4 h-4 mr-2" />
            {loc.address && !shouldHideAddress ? (
              <a
                href={`https://maps.apple.com/?address=${encodeURIComponent(loc.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-700 hover:text-[#273351] transition-colors font-normal"
              >
                <span className="font-semibold">{loc.name}</span>
                <span className="mx-2">·</span>
                <span className="underline">{loc.address}</span>
              </a>
            ) : (
              <span>{loc.name}</span>
            )}
          </h2>

          <div
            className="relative min-h-[120px]"
            style={mapHeight ? { height: `${mapHeight}px` } : undefined}
          >
            <div className={`h-full ${shouldHideAddress ? 'blur-sm' : ''}`}>
              <EventMap
                location={loc.name}
                locationAddress={shouldHideAddress ? null : loc.address}
                eventTitle={eventTitle}
              />
            </div>
            {shouldHideAddress && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center">
                <Lock className="w-8 h-8 text-[#273351] mb-2" />
                {isEventPast ? (
                  <a
                    href="#subscribe-form"
                    className="bg-primary text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors shadow-md text-sm"
                  >
                    RSVP for Address
                  </a>
                ) : (
                  <Link
                    href={`/events/${eventSlug}/register`}
                    className="bg-primary text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors shadow-md text-sm"
                  >
                    RSVP for Address
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
