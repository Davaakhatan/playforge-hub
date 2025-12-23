import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header, Footer } from '@/components/layout';
import { LibraryProvider } from '@/features/library/LibraryContext';
import { AuthProvider } from '@/features/auth/AuthContext';
import { ThemeProvider } from '@/features/theme';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'Playforge - Indie Game Hub',
    template: '%s | Playforge',
  },
  description: 'Discover and play amazing indie games in one place. Browse web games, downloads, and external links from indie developers.',
  keywords: ['indie games', 'game hub', 'web games', 'game launcher', 'play games online'],
  authors: [{ name: 'Playforge' }],
  creator: 'Playforge',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Playforge',
    title: 'Playforge - Indie Game Hub',
    description: 'Discover and play amazing indie games in one place.',
    images: [
      {
        url: '/images/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Playforge - Indie Game Hub',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Playforge - Indie Game Hub',
    description: 'Discover and play amazing indie games in one place.',
    images: ['/images/og-image.svg'],
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-192.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            <LibraryProvider>
              <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
            </LibraryProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
