import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MOYD Events',
  description: 'Missouri Young Democrats Events Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="bg-[#273351] text-white">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <a href="/" className="text-xl font-bold">
                MOYD Events
              </a>
              <div className="flex gap-6">
                <a href="/" className="hover:underline">Events</a>
                <a href="/my-events" className="hover:underline">My Events</a>
                <a href="/admin/events" className="hover:underline">Admin</a>
              </div>
            </div>
          </div>
        </nav>
        <main>{children}</main>
        <footer className="bg-gray-100 mt-12">
          <div className="container mx-auto px-4 py-8 text-center text-gray-600">
            <p>© 2025 Missouri Young Democrats. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
