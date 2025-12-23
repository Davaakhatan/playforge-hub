'use client';

import { useLibrary } from '@/features/library/LibraryContext';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  gameId: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function FavoriteButton({ gameId, className, size = 'md' }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useLibrary();
  const favorited = isFavorite(gameId);

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(gameId);
      }}
      className={cn(
        'group/fav',
        favorited && 'text-blue-500 hover:text-blue-400',
        className
      )}
      aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={favorited ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={2}
        className="h-5 w-5 transition-transform group-hover/fav:scale-110"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    </Button>
  );
}
