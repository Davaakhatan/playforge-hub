'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { GameGrid } from './GameGrid';
import { Pagination } from '@/components/ui/Pagination';
import type { GameEntry } from '@/types';

interface PaginatedGameGridProps {
  games: GameEntry[];
  totalPages: number;
  currentPage: number;
  emptyMessage?: string;
}

export function PaginatedGameGrid({
  games,
  totalPages,
  currentPage,
  emptyMessage,
}: PaginatedGameGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete('page');
    } else {
      params.set('page', String(page));
    }
    router.push(`/?${params.toString()}`);
    // Scroll to top of game grid
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
      <GameGrid games={games} emptyMessage={emptyMessage} />
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          className="mt-8"
        />
      )}
    </div>
  );
}
