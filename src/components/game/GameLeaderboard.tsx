'use client';

import { useState, useEffect } from 'react';

interface LeaderboardEntry {
  rank: number;
  playerName: string;
  score: number;
  wave?: number;
  createdAt: string;
}

interface GameLeaderboardProps {
  gameId: string;
}

export function GameLeaderboard({ gameId }: GameLeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const response = await fetch(`/api/games/${gameId}/scores?limit=10`);
        if (!response.ok) throw new Error('Failed to fetch leaderboard');
        const data = await response.json();
        setLeaderboard(data.leaderboard || []);
      } catch {
        setError('Could not load leaderboard');
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, [gameId]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-10 rounded bg-zinc-200 dark:bg-zinc-800" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-zinc-100 p-4 text-center text-sm text-zinc-500 dark:bg-zinc-800">
        {error}
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="rounded-lg bg-zinc-100 p-6 text-center dark:bg-zinc-800">
        <p className="text-zinc-500 dark:text-zinc-400">No scores yet!</p>
        <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-500">
          Be the first to set a high score.
        </p>
      </div>
    );
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'text-yellow-500';
      case 2:
        return 'text-zinc-400';
      case 3:
        return 'text-amber-600';
      default:
        return 'text-zinc-500 dark:text-zinc-400';
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
        return `#${rank}`;
    }
  };

  return (
    <div className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
      <h4 className="mb-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">Leaderboard</h4>
      <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="w-full">
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-sm dark:border-zinc-800 dark:bg-zinc-900">
            <th className="px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Rank</th>
            <th className="px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Player</th>
            <th className="px-4 py-3 text-right font-medium text-zinc-500 dark:text-zinc-400">Score</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((entry, index) => (
            <tr
              key={index}
              className="border-b border-zinc-100 last:border-0 dark:border-zinc-800"
            >
              <td className="px-4 py-3">
                <span className={`font-bold ${getRankColor(entry.rank)}`}>
                  {getRankIcon(entry.rank)}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className="font-medium text-zinc-900 dark:text-white">
                  {entry.playerName || 'Anonymous'}
                </span>
                {entry.wave && (
                  <span className="ml-2 text-xs text-zinc-400">Wave {entry.wave}</span>
                )}
              </td>
              <td className="px-4 py-3 text-right">
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {entry.score.toLocaleString()}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>
    </div>
  );
}
