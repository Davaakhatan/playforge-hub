'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LeaderboardUser {
  rank: number;
  id: string;
  username: string;
  avatar: string | null;
  xp: number;
  level: number;
  gamesPlayed?: number;
  achievementsCount?: number;
}

type LeaderboardType = 'xp' | 'level' | 'games' | 'achievements';

const TABS: { value: LeaderboardType; label: string }[] = [
  { value: 'xp', label: 'XP' },
  { value: 'level', label: 'Level' },
  { value: 'games', label: 'Games Played' },
  { value: 'achievements', label: 'Achievements' },
];

export default function LeaderboardPage() {
  const [type, setType] = useState<LeaderboardType>('xp');
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/leaderboard?type=${type}&limit=50`);
        const data = await response.json();
        if (response.ok) {
          setUsers(data.users);
        }
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [type]);

  const getValue = (user: LeaderboardUser) => {
    switch (type) {
      case 'xp':
        return `${user.xp.toLocaleString()} XP`;
      case 'level':
        return `Level ${user.level}`;
      case 'games':
        return `${user.gamesPlayed || 0} games`;
      case 'achievements':
        return `${user.achievementsCount || 0} badges`;
      default:
        return '';
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400';
      case 2:
        return 'bg-zinc-400/20 border-zinc-400/50 text-zinc-300';
      case 3:
        return 'bg-orange-500/20 border-orange-500/50 text-orange-400';
      default:
        return 'bg-zinc-800 border-zinc-700 text-zinc-400';
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white">Leaderboard</h1>
        <p className="mt-2 text-zinc-400">
          See how you rank against other players
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex flex-wrap justify-center gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setType(tab.value)}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              type === tab.value
                ? 'bg-blue-500 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Leaderboard */}
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="flex animate-pulse items-center gap-4 rounded-lg bg-zinc-800 p-4"
            >
              <div className="h-8 w-8 rounded bg-zinc-700" />
              <div className="h-10 w-10 rounded-full bg-zinc-700" />
              <div className="flex-1">
                <div className="h-4 w-32 rounded bg-zinc-700" />
              </div>
              <div className="h-4 w-20 rounded bg-zinc-700" />
            </div>
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-lg bg-zinc-800 p-12 text-center">
          <p className="text-zinc-400">No users found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {users.map((user) => (
            <Link
              key={user.id}
              href={`/users/${user.username}`}
              className={cn(
                'flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-zinc-700/50',
                getRankStyle(user.rank)
              )}
            >
              {/* Rank */}
              <div className="flex h-8 w-8 items-center justify-center text-lg font-bold">
                {getRankIcon(user.rank) || `#${user.rank}`}
              </div>

              {/* Avatar */}
              <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-zinc-700">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-zinc-400">
                    {user.username[0].toUpperCase()}
                  </div>
                )}
              </div>

              {/* User info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white">{user.username}</p>
                <p className="text-sm text-zinc-400">Level {user.level}</p>
              </div>

              {/* Value */}
              <div className="text-right">
                <p className="font-bold text-white">{getValue(user)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
