import Link from 'next/link';
import { UserMenu } from '@/components/auth/UserMenu';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/95 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
            <span className="text-lg font-bold text-white">P</span>
          </div>
          <span className="text-xl font-bold text-white">Playforge</span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
          >
            Store
          </Link>
          <Link
            href="/library"
            className="text-sm font-medium text-zinc-400 transition-colors hover:text-white"
          >
            Library
          </Link>
          <UserMenu />
        </nav>
      </div>
    </header>
  );
}
