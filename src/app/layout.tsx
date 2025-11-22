import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { MobileMenu } from '@/components/MobileMenu';
import './globals.css';

const montserrat = Montserrat({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'] });

export const metadata: Metadata = {
  title: 'Events - Missouri Young Democrats',
  description: 'Join us at Missouri Young Democrats events. Connect, organize, and make a difference in our community.',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    title: 'Events - Missouri Young Democrats',
    description: 'Join us at Missouri Young Democrats events. Connect, organize, and make a difference in our community.',
    images: [
      {
        url: '/social-share-image.png',
        width: 1200,
        height: 630,
        alt: 'Missouri Young Democrats Events',
      },
    ],
    type: 'website',
    siteName: 'Missouri Young Democrats',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Events - Missouri Young Democrats',
    description: 'Join us at Missouri Young Democrats events. Connect, organize, and make a difference in our community.',
    images: ['/social-share-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={montserrat.className} style={{ backgroundColor: '#273351' }}>
        {/* MapKit JS with libraries */}
        <Script
          id="mapkit-js"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var script = document.createElement('script');
                script.src = 'https://cdn.apple-mapkit.com/mk/5.x.x/mapkit.core.js';
                script.crossOrigin = 'anonymous';
                script.setAttribute('data-libraries', 'map,services,annotations');
                script.async = true;
                document.head.appendChild(script);
              })();
            `
          }}
        />
        {/* Background */}
        <div
          className="fixed inset-0 z-0"
          style={{
            backgroundColor: '#273351',
            backgroundImage: 'url(/Blue-Gradient-Background.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed'
          }}
        />

        {/* Header */}
        <header className="relative z-50">
          {/* Header Title Nav Wrapper */}
          <div className="header-title-nav-wrapper flex items-center justify-between" style={{
            paddingLeft: '2.7vw',
            paddingRight: '2.7vw',
            paddingTop: '20px',
            paddingBottom: '20px',
            minHeight: '68px',
            height: 'auto'
          }}>
            {/* Logo */}
            <Link href="https://moyoungdemocrats.org" className="flex items-center relative z-50">
              <Image
                src="/text-logo-960png.png"
                alt="Missouri Young Democrats"
                width={143}
                height={68}
                className="w-auto h-[30px] md:h-[68px]"
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center" style={{ gap: '0.8vw' }}>
              <Link
                href="https://moyoungdemocrats.org/our-team"
                className="text-white hover:text-white/80 transition-colors uppercase"
                style={{
                  fontFamily: 'Montserrat',
                  fontStyle: 'normal',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  height: '1.8vw',
                  letterSpacing: '-0.07em'
                }}
              >
                OUR TEAM
              </Link>
              <Link
                href="https://moyoungdemocrats.org/chapters"
                className="text-white hover:text-white/80 transition-colors uppercase"
                style={{
                  fontFamily: 'Montserrat',
                  fontStyle: 'normal',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  height: '1.8vw',
                  letterSpacing: '-0.07em'
                }}
              >
                CHAPTERS
              </Link>
              <Link
                href="https://moyoungdemocrats.org/about"
                className="text-white hover:text-white/80 transition-colors uppercase"
                style={{
                  fontFamily: 'Montserrat',
                  fontStyle: 'normal',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  height: '1.8vw',
                  letterSpacing: '-0.07em'
                }}
              >
                ABOUT
              </Link>
              <Link
                href="https://moyoungdemocrats.org/donate"
                className="text-white hover:text-white/80 transition-colors uppercase"
                style={{
                  fontFamily: 'Montserrat',
                  fontStyle: 'normal',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  height: '1.8vw',
                  letterSpacing: '-0.07em'
                }}
              >
                DONATE
              </Link>
              <Link
                href="https://moyoungdemocrats.org/contact"
                className="text-white hover:text-white/80 transition-colors uppercase"
                style={{
                  fontFamily: 'Montserrat',
                  fontStyle: 'normal',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  height: '1.8vw',
                  letterSpacing: '-0.07em'
                }}
              >
                CONTACT
              </Link>
              <Link
                href="https://moyoungdemocrats.org/members"
                className="text-white hover:text-white/80 transition-colors uppercase"
                style={{
                  fontFamily: 'Montserrat',
                  fontStyle: 'normal',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  height: '1.8vw',
                  letterSpacing: '-0.07em'
                }}
              >
                MEMBERS
              </Link>
            </nav>

            {/* Mobile Menu */}
            <MobileMenu />
          </div>
        </header>

        {/* Main Content */}
        <main className="min-h-screen relative z-10">
          {children}
        </main>

        {/* Footer */}
        <footer className="relative z-10" style={{ backgroundColor: '#273351' }}>
          <div className="container-custom py-12">
            {/* Social Media Icons */}
            <div className="flex justify-center items-center space-x-3 md:space-x-6 mb-8">
              <a href="https://www.instagram.com/moyoungdemocrats/#" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                <Image src="/icons/icons8-instagram-100.png" alt="Instagram" width={32} height={32} />
              </a>
              <a href="https://www.facebook.com/MOyoungdemocrats" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                <Image src="/icons/icons8-facebook-100.png" alt="Facebook" width={32} height={32} />
              </a>
              <a href="https://www.threads.com/@moyoungdemocrats" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                <Image src="/icons/new-Threads-app-icon-white-png-small-size.png" alt="Threads" width={32} height={32} />
              </a>
              <a href="https://x.com/moyoungdems" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                <Image src="/icons/icons8-x-100.png" alt="X (Twitter)" width={32} height={32} />
              </a>
              <a href="https://bsky.app/profile/moyoungdemocrats.bsky.social" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                <Image src="/icons/icons8-bluesky-100.png" alt="Bluesky" width={32} height={32} />
              </a>
              <a href="https://www.tiktok.com/@moyoungdemocrats" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                <Image src="/icons/tiktok-100.png" alt="TikTok" width={32} height={32} />
              </a>
              <a href="https://www.reddit.com/user/moyoungdemocrats/" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                <Image src="/icons/icons8-reddit-240.png" alt="Reddit" width={32} height={32} />
              </a>
              <a href="https://www.youtube.com/@MOYoungDemocrats" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                <Image src="/icons/icons8-youtube-250.png" alt="YouTube" width={32} height={32} />
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
            style={{ backgroundColor: '#43729C' }}
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
          <a
            href="https://secure.actblue.com/donate/moyd"
            target="_blank"
            rel="noopener noreferrer"
            className="flex justify-center py-8"
          >
            <Image
              src="/paid-for-banner.png"
              alt="Paid for by Missouri Young Democrats"
              width={400}
              height={100}
              className="max-w-full h-auto hover:opacity-80 transition-opacity cursor-pointer"
            />
          </a>
        </footer>
        <SpeedInsights />
      </body>
    </html>
  );
}
