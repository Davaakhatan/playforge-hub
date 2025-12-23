import Link from 'next/link';
import Image from 'next/image';
import { UserMenu } from '@/components/auth/UserMenu';
import { ThemeToggle } from '@/features/theme';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/95 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/80 dark:border-zinc-800 dark:bg-zinc-950/95">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center">
          <Image
            src="/images/logo.png"
            alt="Playforge"
            width={240}
            height={64}
            className="h-14 w-auto"
            priority
          />
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-400 transition-colors hover:text-white dark:text-zinc-400 dark:hover:text-white"
          >
            Store
          </Link>
          <Link
            href="/library"
            className="text-sm font-medium text-zinc-400 transition-colors hover:text-white dark:text-zinc-400 dark:hover:text-white"
          >
            Library
          </Link>
          <Link
            href="/collections"
            className="text-sm font-medium text-zinc-400 transition-colors hover:text-white dark:text-zinc-400 dark:hover:text-white"
          >
            Collections
          </Link>
          <ThemeToggle />
          <UserMenu />
        </nav>
      </div>
    </header>
  );
}
