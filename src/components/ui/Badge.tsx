import { cn } from '@/lib/utils';
import type { GameEntry } from '@/types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'size' | 'type' | 'status';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variant === 'default' && 'bg-zinc-800 text-zinc-300',
        variant === 'size' && 'bg-blue-500/20 text-blue-400',
        variant === 'type' && 'bg-cyan-500/20 text-cyan-400',
        variant === 'status' && 'bg-green-500/20 text-green-400',
        className
      )}
    >
      {children}
    </span>
  );
}

// Specialized badges for game properties
export function SizeBadge({ size }: { size: GameEntry['size'] }) {
  const labels = {
    mini: 'Mini',
    medium: 'Medium',
    big: 'Big',
  };

  return <Badge variant="size">{labels[size]}</Badge>;
}

export function TypeBadge({ type }: { type: GameEntry['type'] }) {
  const labels = {
    'web-embed': 'Web',
    external: 'External',
    download: 'Download',
  };

  return <Badge variant="type">{labels[type]}</Badge>;
}

export function StatusBadge({ status }: { status: GameEntry['releaseStatus'] }) {
  const labels = {
    prototype: 'Prototype',
    'early-access': 'Early Access',
    released: 'Released',
  };

  const colors = {
    prototype: 'bg-yellow-500/20 text-yellow-400',
    'early-access': 'bg-orange-500/20 text-orange-400',
    released: 'bg-green-500/20 text-green-400',
  };

  return <Badge className={colors[status]}>{labels[status]}</Badge>;
}

export function TagBadge({ tag }: { tag: string }) {
  return <Badge>{tag}</Badge>;
}
