import Link from 'next/link';
import { ArrowLeft, Calendar } from 'lucide-react';

export default function EventPassedPage() {
  return (
    <div className="min-h-screen py-8">
      {/* Back Button */}
      <div className="container-custom mb-6">
        <Link
          href="/"
          className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all"
          aria-label="Back to Events"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </div>

      {/* Main Content */}
      <div className="container-custom py-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-soft p-8 md:p-12 text-center">
            <div className="mb-6 flex justify-center">
              <Calendar className="w-16 h-16 text-[#273351]" />
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-[#273351] mb-4">
              This Event Has Already Passed
            </h1>

            <p className="text-lg text-gray-700 mb-8">
              Unfortunately, this event has already taken place. But don't worry—there are more great events coming up!
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-[#273351] mb-3">
                Stay Updated on Future Events
              </h2>
              <p className="text-gray-700 mb-4">
                Subscribe to our emails to be the first to know about upcoming events and never miss out again.
              </p>
              <a
                href="#subscribe"
                className="inline-block bg-[#273351] text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Subscribe to Email Updates
              </a>
            </div>

            <Link
              href="/"
              className="inline-block text-[#273351] hover:opacity-70 font-semibold text-lg transition-opacity"
            >
              View All Upcoming Events
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
