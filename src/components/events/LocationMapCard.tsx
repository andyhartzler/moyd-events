"use client";

import Link from 'next/link';
import { useState } from 'react';
import { Lock, MapPin } from 'lucide-react';

import { EventMap } from '@/components/events/EventMap';
import { SubscribePromptModal } from '@/components/events/SubscribePromptModal';

interface LocationMapCardProps {
  displayLocation: string;
  eventTitle: string;
  locationAddress: string | null;
  shouldHideAddress: boolean;
  isEventPast: boolean;
  eventSlug: string;
  isMultiLocation: boolean;
}

export function LocationMapCard({
  displayLocation,
  eventTitle,
  locationAddress,
  shouldHideAddress,
  isEventPast,
  eventSlug,
  isMultiLocation,
}: LocationMapCardProps) {
  const [showSubscribePrompt, setShowSubscribePrompt] = useState(false);

  const handleSubscribePrompt = () => setShowSubscribePrompt(true);

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-soft p-5 lg:flex-1 flex flex-col">
      <h2 className="text-xl font-bold text-[#273351] mb-2 flex items-center">
        <MapPin className="w-5 h-5 mr-2" />
        Location
      </h2>
      <div className="mb-3">
        {!isMultiLocation && locationAddress && !shouldHideAddress ? (
          <a
            href={`https://maps.apple.com/?address=${encodeURIComponent(locationAddress)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-700 hover:text-[#273351] transition-colors"
          >
            <span className="font-semibold">{displayLocation}</span>
            <span className="mx-2">·</span>
            <span className="underline">{locationAddress}</span>
          </a>
        ) : (
          <p className="text-sm font-semibold text-gray-900">{displayLocation}</p>
        )}
      </div>

      {/* Apple Maps Integration - grows to fill available space */}
      <div className="relative flex-1 min-h-[200px]">
        <div className={`h-full ${shouldHideAddress ? 'blur-sm' : ''}`}>
          <EventMap
            location={displayLocation}
            locationAddress={shouldHideAddress ? null : (!isMultiLocation ? locationAddress : null)}
            eventTitle={eventTitle}
          />
        </div>
        {shouldHideAddress && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center">
            <Lock className="w-10 h-10 text-[#273351] mb-3" />
            {isEventPast ? (
              <button
                onClick={handleSubscribePrompt}
                className="bg-primary text-white font-semibold px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors shadow-md"
              >
                RSVP for the Address
              </button>
            ) : (
              <Link
                href={`/events/${eventSlug}/register`}
                className="bg-primary text-white font-semibold px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors shadow-md"
              >
                RSVP for the Address
              </Link>
            )}
          </div>
        )}
      </div>

      <SubscribePromptModal open={showSubscribePrompt} onClose={() => setShowSubscribePrompt(false)} />
    </div>
  );
}
