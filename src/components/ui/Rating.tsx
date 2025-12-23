'use client';

import { cn } from '@/lib/utils';

interface RatingProps {
  rating: number;
  reviewCount?: number;
  size?: 'sm' | 'md';
  showCount?: boolean;
  className?: string;
}

export function Rating({ rating, reviewCount, size = 'sm', showCount = true, className }: RatingProps) {
  const starSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  const ariaLabel = reviewCount !== undefined && reviewCount > 0
    ? `${rating.toFixed(1)} out of 5 stars based on ${reviewCount} reviews`
    : `${rating.toFixed(1)} out of 5 stars`;

  return (
    <div className={cn('flex items-center gap-1', className)} role="img" aria-label={ariaLabel}>
      <div className="flex" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className={cn(
              starSize,
              star <= Math.round(rating)
                ? 'text-yellow-400'
                : 'text-zinc-300 dark:text-zinc-600'
            )}
          >
            <path
              fillRule="evenodd"
              d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
              clipRule="evenodd"
            />
          </svg>
        ))}
      </div>
      {showCount && reviewCount !== undefined && reviewCount > 0 && (
        <span className={cn(textSize, 'text-zinc-500 dark:text-zinc-400')} aria-hidden="true">
          ({reviewCount})
        </span>
      )}
    </div>
  );
}
