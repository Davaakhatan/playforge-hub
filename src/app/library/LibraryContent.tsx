'use client';

import { useLibrary } from '@/features/library/LibraryContext';
import { useAuth } from '@/features/auth/AuthContext';
import { GameGrid } from '@/components/game';
import type { GameEntry } from '@/types';
import Link from 'next/link';

interface LibraryContentProps {
  allGames: GameEntry[];
}

export function LibraryContent({ allGames }: LibraryContentProps) {
  const { favorites, recentlyPlayed } = useLibrary();
  const { user, isLoading } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  // Require login to view library
  if (!user) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-900/50 text-center">
        <div className="mb-4 rounded-full bg-zinc-800 p-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-8 w-8 text-zinc-500"
          >
            <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
          </svg>
        </div>
        <h2 className="mb-2 text-lg font-semibold text-white">Sign in to view your Library</h2>
        <p className="mb-4 max-w-md text-sm text-zinc-400">
          Your favorites and recently played games are synced to your account. Sign in to access your personal library.
        </p>
        <div className="flex gap-3">
          <Link
            href="/login"
            className="inline-flex items-center rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2 text-sm font-medium text-white transition-all hover:from-blue-600 hover:to-cyan-600"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
          >
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  // Get favorite games
  const favoriteGames = allGames.filter((game) =>
    favorites.includes(game.id)
  );

  // Get recently played games in order
  const recentGames = recentlyPlayed
    .map((entry) => allGames.find((game) => game.id === entry.gameId))
    .filter((game): game is GameEntry => game !== undefined);

  const hasNoLibrary = favoriteGames.length === 0 && recentGames.length === 0;

  if (hasNoLibrary) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-900/50 text-center">
        <div className="mb-4 rounded-full bg-zinc-800 p-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-8 w-8 text-zinc-500"
          >
            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
          </svg>
        </div>
        <h2 className="mb-2 text-lg font-semibold text-white">Your Library is Empty</h2>
        <p className="mb-4 max-w-md text-sm text-zinc-400">
          Start playing games to build your library. Your favorites and recently played games will appear here.
        </p>
        <Link
          href="/"
          className="inline-flex items-center rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2 text-sm font-medium text-white transition-all hover:from-blue-600 hover:to-cyan-600"
        >
          Browse Games
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Favorites Section */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-5 w-5 text-blue-500"
          >
            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
          </svg>
          <h2 className="text-xl font-bold text-white">Favorites</h2>
          <span className="text-sm text-zinc-500">({favoriteGames.length})</span>
        </div>
        <GameGrid
          games={favoriteGames}
          emptyMessage="No favorite games yet. Click the heart icon on any game to add it to your favorites."
        />
      </section>

      {/* Recently Played Section */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-5 w-5 text-cyan-500"
          >
            <path
              fillRule="evenodd"
              d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z"
              clipRule="evenodd"
            />
          </svg>
          <h2 className="text-xl font-bold text-white">Recently Played</h2>
          <span className="text-sm text-zinc-500">({recentGames.length})</span>
        </div>
        <GameGrid
          games={recentGames}
          emptyMessage="No recently played games. Start playing to see your history here."
        />
      </section>
    </div>
  );
}
