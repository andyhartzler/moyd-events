"use client";

import Link from 'next/link';
import { X } from 'lucide-react';

import { Button } from '@/components/ui/Button';

interface SubscribePromptModalProps {
  open: boolean;
  onClose: () => void;
}

export function SubscribePromptModal({ open, onClose }: SubscribePromptModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 text-center space-y-4 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-semibold text-[#273351]">
          This event has already happened
        </h3>
        <p className="text-sm text-gray-700 leading-relaxed">
          Subscribe to stay up to date on future events and be the first to know when new events are announced.
        </p>

        <div className="flex flex-col gap-2">
          <Link
            href="/subscribe"
            className="w-full"
          >
            <Button className="w-full" size="lg">
              Subscribe
            </Button>
          </Link>
          <Button variant="outline" onClick={onClose} size="lg" className="w-full">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
