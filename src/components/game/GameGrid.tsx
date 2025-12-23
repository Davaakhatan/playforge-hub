import type { GameEntry } from '@/types';
import { GameCard } from './GameCard';
import { cn } from '@/lib/utils';

interface GameGridProps {
  games: GameEntry[];
  emptyMessage?: string;
  className?: string;
}

export function GameGrid({ games, emptyMessage = 'No games found', className }: GameGridProps) {
  if (games.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
        <p className="text-zinc-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn('grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4', className)}>
      {games.map(game => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  );
}
