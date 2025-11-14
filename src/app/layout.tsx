import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { Calendar, Users, MapPin, Mail, Facebook, Twitter, Instagram } from 'lucide-react';
import './globals.css';

const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'] });

export const metadata: Metadata = {
  title: 'MOYD Events - Missouri Young Democrats',
  description: 'Join us at Missouri Young Democrats events. Connect, organize, and make a difference in our community.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Navigation */}
        <nav className="gradient-primary shadow-lg sticky top-0 z-50">
          <div className="container-custom">
            <div className="flex items-center justify-between h-20">
              {/* Logo */}
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="bg-white p-2 rounded-lg group-hover:scale-105 transition-transform">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="text-white font-bold text-xl leading-tight">MOYD Events</div>
                  <div className="text-primary-200 text-xs">Missouri Young Democrats</div>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                <Link
                  href="/"
                  className="text-white hover:text-primary-100 font-medium transition-colors"
                >
                  Events
                </Link>
                <Link
                  href="/my-events"
                  className="text-white hover:text-primary-100 font-medium transition-colors"
                >
                  My Events
                </Link>
                <Link
                  href="/admin/events"
                  className="text-white hover:text-primary-100 font-medium transition-colors"
                >
                  Admin
                </Link>
                <Link
                  href="/contact"
                  className="bg-white text-primary px-5 py-2 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
                >
                  Get Involved
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <button className="md:hidden text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="min-h-screen">{children}</main>

        {/* Footer */}
        <footer className="bg-primary-900 text-white mt-20">
          <div className="container-custom py-12">
            <div className="grid md:grid-cols-4 gap-8">
              {/* About */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold mb-4">Missouri Young Democrats</h3>
                <p className="text-primary-200 text-sm leading-relaxed">
                  Empowering the next generation of Missouri leaders through action, advocacy, and community engagement.
                </p>
                <div className="flex space-x-4 pt-2">
                  <a href="#" className="text-primary-300 hover:text-white transition-colors">
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a href="#" className="text-primary-300 hover:text-white transition-colors">
                    <Twitter className="w-5 h-5" />
                  </a>
                  <a href="#" className="text-primary-300 hover:text-white transition-colors">
                    <Instagram className="w-5 h-5" />
                  </a>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="font-semibold mb-4">Quick Links</h4>
                <ul className="space-y-2 text-primary-200">
                  <li><Link href="/" className="hover:text-white transition-colors">All Events</Link></li>
                  <li><Link href="/my-events" className="hover:text-white transition-colors">My Events</Link></li>
                  <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                  <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                </ul>
              </div>

              {/* Get Involved */}
              <div>
                <h4 className="font-semibold mb-4">Get Involved</h4>
                <ul className="space-y-2 text-primary-200">
                  <li><Link href="/volunteer" className="hover:text-white transition-colors">Volunteer</Link></li>
                  <li><Link href="/donate" className="hover:text-white transition-colors">Donate</Link></li>
                  <li><Link href="/membership" className="hover:text-white transition-colors">Become a Member</Link></li>
                  <li><Link href="/resources" className="hover:text-white transition-colors">Resources</Link></li>
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h4 className="font-semibold mb-4">Contact Us</h4>
                <ul className="space-y-3 text-primary-200 text-sm">
                  <li className="flex items-start space-x-2">
                    <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>info@moyoungdemocrats.org</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Missouri, USA</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-primary-700 mt-8 pt-8 text-center text-primary-300 text-sm">
              <p>© {new Date().getFullYear()} Missouri Young Democrats. All rights reserved.</p>
              <div className="flex justify-center space-x-6 mt-2">
                <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
