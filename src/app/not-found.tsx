import Link from 'next/link';
import { ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen py-12">
      <div className="container-custom mb-8">
        <Link
          href="/"
          className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all"
          aria-label="Back to Events"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </div>

      <div className="container-custom">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-soft p-8 md:p-12 text-center">
            <div className="mb-6 flex justify-center">
              <Search className="w-16 h-16 text-[#273351]" />
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-[#273351] mb-4">Page Not Found</h1>
            <p className="text-lg text-gray-700 mb-8">
              We couldn&rsquo;t find the page you&rsquo;re looking for. Head back to see all of our upcoming events.
            </p>

            <Link
              href="/"
              className="inline-flex items-center justify-center bg-[#273351] text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Return to Events
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
