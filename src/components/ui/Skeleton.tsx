import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800',
        className
      )}
    />
  );
}

export function GameCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      {/* Thumbnail skeleton */}
      <Skeleton className="aspect-video w-full rounded-none" />

      {/* Content skeleton */}
      <div className="flex flex-1 flex-col p-4">
        {/* Title */}
        <Skeleton className="mb-2 h-5 w-3/4" />

        {/* Description */}
        <Skeleton className="mb-1 h-4 w-full" />
        <Skeleton className="mb-3 h-4 w-2/3" />

        {/* Badges */}
        <div className="mt-auto flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function GameGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <GameCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function SearchBarSkeleton() {
  return (
    <Skeleton className="h-12 w-full max-w-xl rounded-xl" />
  );
}

export function FilterSidebarSkeleton() {
  return (
    <div className="space-y-6">
      {/* Section */}
      {[1, 2, 3].map((section) => (
        <div key={section}>
          <Skeleton className="mb-3 h-4 w-16" />
          <div className="space-y-2">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
