'use client';

import { cn } from '@/lib/utils';

interface Achievement {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  rarity: string;
  earned: boolean;
  unlockedAt: string | null;
  progress: number;
}

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
}

const RARITY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  common: {
    bg: 'bg-zinc-600',
    text: 'text-zinc-400',
    border: 'border-zinc-500',
  },
  rare: {
    bg: 'bg-blue-600',
    text: 'text-blue-400',
    border: 'border-blue-500',
  },
  epic: {
    bg: 'bg-purple-600',
    text: 'text-purple-400',
    border: 'border-purple-500',
  },
  legendary: {
    bg: 'bg-yellow-600',
    text: 'text-yellow-400',
    border: 'border-yellow-500',
  },
};

export function AchievementBadge({
  achievement,
  size = 'md',
  showProgress = true,
}: AchievementBadgeProps) {
  const colors = RARITY_COLORS[achievement.rarity] || RARITY_COLORS.common;

  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-16 w-16',
    lg: 'h-20 w-20',
  };

  const iconSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <div
      className={cn(
        'relative flex flex-col items-center',
        !achievement.earned && 'opacity-50'
      )}
    >
      <div
        className={cn(
          'relative flex items-center justify-center rounded-full border-2',
          sizeClasses[size],
          achievement.earned
            ? `${colors.bg} ${colors.border}`
            : 'border-zinc-600 bg-zinc-800'
        )}
      >
        <span className={cn(iconSizes[size])}>{achievement.icon}</span>

        {/* Progress ring */}
        {showProgress && !achievement.earned && achievement.progress > 0 && (
          <svg
            className="absolute inset-0"
            viewBox="0 0 100 100"
          >
            <circle
              className="stroke-zinc-700"
              strokeWidth="4"
              fill="none"
              r="46"
              cx="50"
              cy="50"
            />
            <circle
              className={colors.text.replace('text-', 'stroke-')}
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
              r="46"
              cx="50"
              cy="50"
              strokeDasharray={`${achievement.progress * 2.89} 289`}
              transform="rotate(-90 50 50)"
            />
          </svg>
        )}

        {/* Locked icon */}
        {!achievement.earned && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-4 w-4 text-zinc-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          </div>
        )}
      </div>

      <div className="mt-2 text-center">
        <p className="text-xs font-medium text-white">{achievement.name}</p>
        {showProgress && !achievement.earned && (
          <p className="text-xs text-zinc-500">{achievement.progress}%</p>
        )}
      </div>
    </div>
  );
}

interface AchievementCardProps {
  achievement: Achievement;
}

export function AchievementCard({ achievement }: AchievementCardProps) {
  const colors = RARITY_COLORS[achievement.rarity] || RARITY_COLORS.common;

  return (
    <div
      className={cn(
        'flex items-start gap-4 rounded-lg border p-4 transition-colors',
        achievement.earned
          ? `${colors.border} bg-zinc-800`
          : 'border-zinc-700 bg-zinc-800/50'
      )}
    >
      <div
        className={cn(
          'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-2 text-xl',
          achievement.earned
            ? `${colors.bg} ${colors.border}`
            : 'border-zinc-600 bg-zinc-700'
        )}
      >
        {achievement.icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3
            className={cn(
              'font-medium',
              achievement.earned ? 'text-white' : 'text-zinc-400'
            )}
          >
            {achievement.name}
          </h3>
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-xs font-medium capitalize',
              colors.bg,
              'text-white'
            )}
          >
            {achievement.rarity}
          </span>
        </div>

        <p className="mt-1 text-sm text-zinc-400">{achievement.description}</p>

        <div className="mt-2 flex items-center gap-4">
          {achievement.xpReward > 0 && (
            <span className="text-xs text-yellow-400">
              +{achievement.xpReward} XP
            </span>
          )}

          {achievement.earned && achievement.unlockedAt && (
            <span className="text-xs text-zinc-500">
              Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
            </span>
          )}

          {!achievement.earned && (
            <div className="flex-1">
              <div className="h-1.5 overflow-hidden rounded-full bg-zinc-700">
                <div
                  className={cn('h-full transition-all', colors.bg)}
                  style={{ width: `${achievement.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
