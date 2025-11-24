import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Metadata } from 'next';
import { CreateEventForm } from '@/components/events/CreateEventForm';

export const metadata: Metadata = {
  title: 'Create an Event - Missouri Young Democrats',
  description: 'Share your event so we can help spread the word.',
};

export default function CreateEventPage() {
  return (
    <div className="py-12">
      <div className="container-custom max-w-5xl">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all"
            aria-label="Back to Events"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 md:p-10">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Create an Event</h1>
            <p className="text-gray-700 max-w-2xl mx-auto">
              Share the details of your event below, and we&rsquo;ll contact you if we need more information.
            </p>
          </div>
          <CreateEventForm />
        </div>
      </div>
    </div>
  );
}
