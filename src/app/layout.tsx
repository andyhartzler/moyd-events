import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import Image from 'next/image';
import './globals.css';

const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'] });

export const metadata: Metadata = {
  title: 'Events - Missouri Young Democrats',
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
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="container-custom">
            <div className="flex items-center justify-between h-20">
              {/* Logo */}
              <Link href="https://moyoungdemocrats.org" className="flex items-center">
                <Image
                  src="/text-logo-960png.png"
                  alt="Missouri Young Democrats"
                  width={200}
                  height={50}
                  className="h-12 w-auto"
                />
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                <Link
                  href="https://moyoungdemocrats.org/our-team"
                  className="text-gray-700 hover:text-[#273351] font-medium transition-colors uppercase text-sm"
                >
                  OUR TEAM
                </Link>
                <Link
                  href="https://moyoungdemocrats.org/chapters"
                  className="text-gray-700 hover:text-[#273351] font-medium transition-colors uppercase text-sm"
                >
                  CHAPTERS
                </Link>
                <Link
                  href="https://moyoungdemocrats.org/about"
                  className="text-gray-700 hover:text-[#273351] font-medium transition-colors uppercase text-sm"
                >
                  ABOUT
                </Link>
                <Link
                  href="https://moyoungdemocrats.org/donate"
                  className="text-gray-700 hover:text-[#273351] font-medium transition-colors uppercase text-sm"
                >
                  DONATE
                </Link>
                <Link
                  href="https://moyoungdemocrats.org/contact"
                  className="text-gray-700 hover:text-[#273351] font-medium transition-colors uppercase text-sm"
                >
                  CONTACT
                </Link>
                <Link
                  href="https://moyoungdemocrats.org/members"
                  className="text-gray-700 hover:text-[#273351] font-medium transition-colors uppercase text-sm"
                >
                  MEMBERS
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <button className="md:hidden text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </nav>

        {/* Main Content with Background */}
        <main className="min-h-screen relative">
          <div
            className="fixed inset-0 z-0"
            style={{
              backgroundImage: 'url(/Blue-Gradient-Background.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundAttachment: 'fixed'
            }}
          />
          <div className="relative z-10">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="relative z-10" style={{ backgroundColor: '#273351' }}>
          <div className="container-custom py-12">
            {/* Social Media Icons */}
            <div className="flex justify-center items-center space-x-6 mb-8">
              <a href="https://www.instagram.com/moyoungdems" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                <Image src="/icons/icons8-instagram-100.png" alt="Instagram" width={32} height={32} />
              </a>
              <a href="https://www.facebook.com/YoungDemsMO" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                <Image src="/icons/icons8-facebook-100.png" alt="Facebook" width={32} height={32} />
              </a>
              <a href="https://www.threads.net/@moyoungdems" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                <Image src="/icons/new-Threads-app-icon-white-png-small-size.png" alt="Threads" width={32} height={32} />
              </a>
              <a href="https://twitter.com/MOYoungDems" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                <Image src="/icons/icons8-x-100.png" alt="X (Twitter)" width={32} height={32} />
              </a>
              <a href="https://bsky.app/profile/moyoungdems.bsky.social" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                <Image src="/icons/icons8-bluesky-100.png" alt="Bluesky" width={32} height={32} />
              </a>
              <a href="https://www.tiktok.com/@moyoungdems" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                <Image src="/icons/tiktok-100.png" alt="TikTok" width={32} height={32} />
              </a>
              <a href="https://www.reddit.com/r/MOYoungDems" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                <Image src="/icons/icons8-reddit-240.png" alt="Reddit" width={32} height={32} />
              </a>
              <a href="mailto:info@moyoungdemocrats.org" className="hover:opacity-80 transition-opacity">
                <Image src="/icons/icons8-email-100 copy.png" alt="Email" width={32} height={32} />
              </a>
            </div>

            {/* Paid For Banner */}
            <div className="flex justify-center">
              <Image
                src="/paid-for-banner.png"
                alt="Paid for by Missouri Young Democrats"
                width={400}
                height={100}
                className="max-w-full h-auto"
              />
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
