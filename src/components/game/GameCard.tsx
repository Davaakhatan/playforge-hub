import Link from 'next/link';
import Image from 'next/image';
import type { GameEntry } from '@/types';
import { SizeBadge, TypeBadge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

interface GameCardProps {
  game: GameEntry;
  className?: string;
}

export function GameCard({ game, className }: GameCardProps) {
  return (
    <Link
      href={`/games/${game.slug}`}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-xl bg-zinc-900 transition-all hover:bg-zinc-800 hover:ring-2 hover:ring-blue-500/50',
        className
      )}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-800">
        <Image
          src={game.thumbnail}
          alt={game.title}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {game.featured && (
          <div className="absolute left-2 top-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 px-2 py-0.5 text-xs font-medium text-white">
            Featured
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="font-semibold text-white line-clamp-1">{game.title}</h3>
        </div>

        <p className="mb-3 text-sm text-zinc-400 line-clamp-2">
          {game.shortDescription}
        </p>

        <div className="mt-auto flex flex-wrap gap-2">
          <SizeBadge size={game.size} />
          <TypeBadge type={game.type} />
        </div>
      </div>
    </Link>
  );
}
