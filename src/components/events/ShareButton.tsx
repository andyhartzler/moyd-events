'use client';

import { Share2 } from 'lucide-react';

export function ShareButton({ title, url, asCard = false }: { title: string; url?: string; asCard?: boolean }) {
  const handleShare = () => {
    const shareUrl = url || window.location.href;

    if (navigator.share) {
      navigator.share({
        title: title,
        text: `Join me at ${title}!`,
        url: shareUrl
      }).catch((error) => {
        console.log('Error sharing:', error);
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert('Link copied to clipboard!');
      }).catch((error) => {
        console.error('Could not copy text:', error);
      });
    }
  };

  // Render as full card if asCard is true
  if (asCard) {
    return (
      <button
        onClick={handleShare}
        className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center shadow-soft hover:opacity-90 transition-opacity w-full"
      >
        <h3 className="font-bold text-[#273351] mb-2">Share This Event</h3>
        <p className="text-sm text-gray-700">
          Help spread the word about this event
        </p>
      </button>
    );
  }

  // Render as simple button
  return (
    <button
      onClick={handleShare}
      className="text-[#273351] hover:opacity-70 font-semibold text-sm transition-opacity"
    >
      Share Event
    </button>
  );
}
