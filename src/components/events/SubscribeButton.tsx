'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export function SubscribeButton() {
  const router = useRouter();

  return (
    <div id="subscribe-form">
      <Button
        onClick={() => router.push('/subscribe')}
        variant="default"
        size="lg"
        className="w-full text-center text-base sm:text-lg py-5 sm:py-6 min-h-[3.5rem] whitespace-normal sm:whitespace-nowrap leading-tight px-12 sm:px-10"
      >
        Stay Up To Date on Future Events
      </Button>
    </div>
  );
}
