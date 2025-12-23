import { Suspense } from 'react';
import { getAllGames } from '@/features/catalog';
import { LibraryContent } from './LibraryContent';

// Force dynamic rendering - requires database at runtime
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'My Library - Playforge',
  description: 'Your favorite and recently played games.',
};

export default async function LibraryPage() {
  const allGames = await getAllGames();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-white">My Library</h1>

      <Suspense fallback={<LibrarySkeleton />}>
        <LibraryContent allGames={allGames} />
      </Suspense>
    </div>
  );
}

function LibrarySkeleton() {
  return (
    <div className="space-y-8">
      {[1, 2].map((section) => (
        <div key={section}>
          <div className="mb-4 h-6 w-32 animate-pulse rounded bg-zinc-800" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4].map((card) => (
              <div key={card} className="overflow-hidden rounded-xl bg-zinc-900">
                <div className="aspect-video animate-pulse bg-zinc-800" />
                <div className="p-4">
                  <div className="mb-2 h-5 w-3/4 animate-pulse rounded bg-zinc-800" />
                  <div className="h-4 w-full animate-pulse rounded bg-zinc-800" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
