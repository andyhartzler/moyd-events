"use client";

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
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
const TILE_PADDING = 32; // p-4 = 16px top + 16px bottom
const TILE_TITLE_HEIGHT = 38; // text-lg with icon and mb-2, adjusted for actual rendering
const TILE_CHROME = TILE_PADDING + TILE_TITLE_HEIGHT; // Total non-map height per tile (70px)

export function MultiLocationMaps({
  locations,
  shouldHideAddress,
  eventTitle,
  eventSlug,
  isEventPast,
  posterElementId = 'event-poster-card',
}: MultiLocationMapsProps) {
  const [calculatedHeight, setCalculatedHeight] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Smaller heights for mobile where layout is stacked vertically
  const fallbackHeight = useMemo(() => {
    const count = locations.length;

    if (isMobile) {
      // Mobile: use smaller, fixed heights
      if (count <= 1) return 200;
      if (count === 2) return 180;
      return 160;
    }

    // Desktop: use taller fallback heights
    if (count <= 1) return 160;
    if (count === 2) return 130;
    return 110;
  }, [locations.length, isMobile]);

  // Detect mobile/desktop on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      // Tailwind lg breakpoint is 1024px
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const computeHeight = () => {
      // On mobile, skip dynamic height calculation and use fallback
      if (isMobile) {
        setCalculatedHeight(null);
        return;
      }

      const poster = document.getElementById(posterElementId);
      const container = containerRef.current;

      if (!poster || !container || locations.length === 0) {
        setCalculatedHeight(null);
        return;
      }

      const posterHeight = poster.getBoundingClientRect().height;
      const posterTop = poster.getBoundingClientRect().top;
      const containerTop = container.getBoundingClientRect().top;

      if (!posterHeight || posterHeight <= 0) {
        setCalculatedHeight(null);
        return;
      }

      const offsetFromPosterTop = containerTop - posterTop;
      const totalGap = GAP_BETWEEN_TILES * (locations.length - 1);
      const available = posterHeight - offsetFromPosterTop - totalGap;
      if (available <= 0) {
        setCalculatedHeight(null);
        return;
      }

      // Calculate height per tile card, then subtract padding and title height
      // to get the actual map height
      const heightPerTileCard = available / locations.length;
      const mapHeight = Math.max(100, heightPerTileCard - TILE_CHROME);
      setCalculatedHeight(mapHeight);
    };

    computeHeight();

    const resizeTarget: any = typeof window !== 'undefined' ? window : null;

    if (!resizeTarget) return undefined;

    if ('ResizeObserver' in resizeTarget) {
      const observer = new ResizeObserver(() => computeHeight());
      const poster = document.getElementById(posterElementId);
      if (poster) observer.observe(poster);
      if (containerRef.current) observer.observe(containerRef.current);
      return () => observer.disconnect();
    }

    resizeTarget.addEventListener('resize', computeHeight);
    return () => resizeTarget.removeEventListener('resize', computeHeight);
  }, [locations.length, posterElementId, isMobile]);

  const mapHeight = calculatedHeight ?? fallbackHeight;

  return (
    <div className="flex flex-col gap-4 lg:h-full" ref={containerRef}>
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
            className="relative"
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
