import { createClient } from '@/lib/supabase/server';
import { EventCard } from '@/components/events/EventCard';
import { Calendar, Users, Megaphone, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default async function HomePage() {
  const supabase = createClient();

  const { data: events } = await supabase
    .from('events')
    .select('*, event_rsvps(count)')
    .eq('status', 'published')
    .gte('event_date', new Date().toISOString())
    .order('event_date', { ascending: true })
    .limit(6);

  const { count: totalEvents } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published')
    .gte('event_date', new Date().toISOString());

  return (
    <div>
      {/* Hero Section */}
      <section className="gradient-primary text-white section-padding relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-300 rounded-full blur-3xl"></div>
        </div>

        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block mb-6">
              <span className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold">
                🎉 Join the Movement
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
              Missouri Young Democrats Events
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-8 leading-relaxed">
              Connect with fellow Democrats, organize for change, and make a difference in our communities across Missouri.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="#events"
                className="bg-white text-primary px-8 py-4 rounded-lg font-bold text-lg hover:bg-primary-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Browse Events
                <ArrowRight className="inline-block ml-2 w-5 h-5" />
              </Link>
              <Link
                href="/contact"
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/10 transition-all duration-200"
              >
                Get Involved
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-12 border-b">
        <div className="container-custom">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="flex justify-center">
                <div className="bg-primary-100 p-4 rounded-full">
                  <Calendar className="w-8 h-8 text-primary" />
                </div>
              </div>
              <div className="text-3xl font-bold text-primary">{totalEvents || 0}</div>
              <div className="text-gray-600 font-medium">Upcoming Events</div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-center">
                <div className="bg-primary-100 p-4 rounded-full">
                  <Users className="w-8 h-8 text-primary" />
                </div>
              </div>
              <div className="text-3xl font-bold text-primary">1,000+</div>
              <div className="text-gray-600 font-medium">Active Members</div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-center">
                <div className="bg-primary-100 p-4 rounded-full">
                  <Megaphone className="w-8 h-8 text-primary" />
                </div>
              </div>
              <div className="text-3xl font-bold text-primary">50+</div>
              <div className="text-gray-600 font-medium">Counties Reached</div>
            </div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-primary mb-4">
              Upcoming Events
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join us at our upcoming events and be part of the change you want to see in Missouri.
            </p>
          </div>

          {events && events.length > 0 ? (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>

              {totalEvents && totalEvents > 6 && (
                <div className="text-center">
                  <Link
                    href="/events"
                    className="inline-flex items-center space-x-2 bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <span>View All Events</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="bg-white rounded-xl shadow-soft p-12 max-w-md mx-auto">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Upcoming Events</h3>
                <p className="text-gray-600">Check back soon for new events and opportunities to get involved!</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-800 text-white section-padding">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Make a Difference?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Join thousands of young Democrats working to build a better future for Missouri.
            </p>
            <Link
              href="/membership"
              className="inline-block bg-white text-primary px-8 py-4 rounded-lg font-bold text-lg hover:bg-primary-50 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Become a Member Today
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
