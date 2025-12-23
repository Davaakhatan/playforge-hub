import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header, Footer } from '@/components/layout';
import { LibraryProvider } from '@/features/library/LibraryContext';
import { AuthProvider } from '@/features/auth/AuthContext';
import { ThemeProvider } from '@/features/theme';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Playforge - Indie Game Hub',
  description: 'Discover and play amazing indie games in one place.',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-zinc-950 text-zinc-100 antialiased dark:bg-zinc-950 dark:text-zinc-100 light:bg-white light:text-zinc-900`}>
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
