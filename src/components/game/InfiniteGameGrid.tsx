'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { GameGrid } from './GameGrid';
import { GameCardSkeleton } from '@/components/ui/Skeleton';
import type { GameEntry } from '@/types';

interface InfiniteGameGridProps {
  initialGames: GameEntry[];
  initialHasMore: boolean;
  totalGames: number;
  emptyMessage?: string;
}

export function InfiniteGameGrid({
  initialGames,
  initialHasMore,
  totalGames,
  emptyMessage,
}: InfiniteGameGridProps) {
  const [games, setGames] = useState<GameEntry[]>(initialGames);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoading, setIsLoading] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();

  // Reset when search params change
  useEffect(() => {
    setGames(initialGames);
    setPage(1);
    setHasMore(initialHasMore);
  }, [initialGames, initialHasMore]);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', String(page + 1));
      params.set('paginate', 'true');

      const response = await fetch(`/api/games?${params.toString()}`);
      const data = await response.json();

      if (data.games && data.games.length > 0) {
        setGames((prev) => [...prev, ...data.games]);
        setPage((prev) => prev + 1);
        setHasMore(data.pagination.hasMore);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more games:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, page, searchParams]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading, loadMore]);

  if (games.length === 0 && !isLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
        <p className="text-zinc-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div>
      <GameGrid games={games} emptyMessage={emptyMessage} />

      {/* Load more trigger */}
      <div ref={loaderRef} className="mt-8">
        {isLoading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <GameCardSkeleton key={i} />
            ))}
          </div>
        )}
      </div>

      {/* Progress indicator */}
      {games.length > 0 && (
        <div className="mt-6 text-center text-sm text-zinc-500">
          Showing {games.length} of {totalGames} games
          {!hasMore && games.length === totalGames && (
            <span className="ml-2 text-zinc-400">- End of list</span>
          )}
        </div>
      )}
    </div>
  );
}
