import type { GameEntry } from '@/types';
import { GameCard } from './GameCard';

interface GameGridProps {
  games: GameEntry[];
  emptyMessage?: string;
}

export function GameGrid({ games, emptyMessage = 'No games found' }: GameGridProps) {
  if (games.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-900/50">
        <p className="text-zinc-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {games.map(game => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  );
}
