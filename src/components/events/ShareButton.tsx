'use client';

export function ShareButton({ title, url }: { title: string; url?: string }) {
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

  return (
    <button
      onClick={handleShare}
      className="text-[#273351] hover:opacity-70 font-semibold text-sm transition-opacity"
    >
      Share Event
    </button>
  );
}
