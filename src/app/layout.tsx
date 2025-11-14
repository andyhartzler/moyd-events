import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import Link from 'next/link';
import Image from 'next/image';
import './globals.css';

const montserrat = Montserrat({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'] });

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
      <body className={montserrat.className}>
        {/* Background */}
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

        {/* Navigation */}
        <nav className="relative z-50 sticky top-0" style={{ height: '1.8vw', minHeight: '60px' }}>
          <div style={{ paddingLeft: '2.7vw', paddingRight: '2.7vw' }}>
            <div className="flex items-center justify-between h-full">
              {/* Logo */}
              <Link href="https://moyoungdemocrats.org" className="flex items-center">
                <Image
                  src="/text-logo-960png.png"
                  alt="Missouri Young Democrats"
                  width={200}
                  height={50}
                  className="h-12 w-auto"
                  priority
                />
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center" style={{ gap: '0.8vw' }}>
                <Link
                  href="https://moyoungdemocrats.org/our-team"
                  className="text-white hover:text-white/80 transition-colors uppercase"
                  style={{
                    fontFamily: 'Montserrat',
                    fontWeight: 800,
                    fontSize: '1.1rem',
                    lineHeight: '1.3em',
                    letterSpacing: '-0.06em'
                  }}
                >
                  OUR TEAM
                </Link>
                <Link
                  href="https://moyoungdemocrats.org/chapters"
                  className="text-white hover:text-white/80 transition-colors uppercase"
                  style={{
                    fontFamily: 'Montserrat',
                    fontWeight: 800,
                    fontSize: '1.1rem',
                    lineHeight: '1.3em',
                    letterSpacing: '-0.06em'
                  }}
                >
                  CHAPTERS
                </Link>
                <Link
                  href="https://moyoungdemocrats.org/about"
                  className="text-white hover:text-white/80 transition-colors uppercase"
                  style={{
                    fontFamily: 'Montserrat',
                    fontWeight: 800,
                    fontSize: '1.1rem',
                    lineHeight: '1.3em',
                    letterSpacing: '-0.06em'
                  }}
                >
                  ABOUT
                </Link>
                <Link
                  href="https://moyoungdemocrats.org/donate"
                  className="text-white hover:text-white/80 transition-colors uppercase"
                  style={{
                    fontFamily: 'Montserrat',
                    fontWeight: 800,
                    fontSize: '1.1rem',
                    lineHeight: '1.3em',
                    letterSpacing: '-0.06em'
                  }}
                >
                  DONATE
                </Link>
                <Link
                  href="https://moyoungdemocrats.org/contact"
                  className="text-white hover:text-white/80 transition-colors uppercase"
                  style={{
                    fontFamily: 'Montserrat',
                    fontWeight: 800,
                    fontSize: '1.1rem',
                    lineHeight: '1.3em',
                    letterSpacing: '-0.06em'
                  }}
                >
                  CONTACT
                </Link>
                <Link
                  href="https://moyoungdemocrats.org/members"
                  className="text-white hover:text-white/80 transition-colors uppercase"
                  style={{
                    fontFamily: 'Montserrat',
                    fontWeight: 800,
                    fontSize: '1.1rem',
                    lineHeight: '1.3em',
                    letterSpacing: '-0.06em'
                  }}
                >
                  MEMBERS
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
        <main className="min-h-screen relative z-10">
          {children}
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
          </div>

          {/* Moving Donation Banner */}
          <a
            href="https://secure.actblue.com/donate/moyd"
            target="_blank"
            rel="noopener noreferrer"
            className="block overflow-hidden py-4"
            style={{ backgroundColor: '#3B82C6' }}
          >
            <div className="marquee-container">
              <div className="marquee-content">
                <span className="marquee-text">DONATE TODAY — YOUR SUPPORT MAKES EVERYTHING POSSIBLE — </span>
                <span className="marquee-text">DONATE TODAY — YOUR SUPPORT MAKES EVERYTHING POSSIBLE — </span>
                <span className="marquee-text">DONATE TODAY — YOUR SUPPORT MAKES EVERYTHING POSSIBLE — </span>
                <span className="marquee-text">DONATE TODAY — YOUR SUPPORT MAKES EVERYTHING POSSIBLE — </span>
              </div>
            </div>
          </a>

          {/* Paid For Banner */}
          <div className="flex justify-center py-8">
            <Image
              src="/paid-for-banner.png"
              alt="Paid for by Missouri Young Democrats"
              width={400}
              height={100}
              className="max-w-full h-auto"
            />
          </div>
        </footer>
      </body>
    </html>
  );
}
