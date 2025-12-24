'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface User {
  id: string;
  username: string;
  email: string;
  avatar: string | null;
  bio: string | null;
  createdAt: Date;
}

interface Stats {
  favoriteCount: number;
  playHistoryCount: number;
  reviewCount: number;
  collectionCount: number;
}

interface PlayHistory {
  id: string;
  lastPlayed: Date;
  game: { slug: string; title: string; thumbnail: string };
}

interface Favorite {
  id: string;
  createdAt: Date;
  game: { slug: string; title: string; thumbnail: string };
}

interface HighScore {
  id: string;
  score: number;
  wave: number | null;
  createdAt: Date;
  game: { slug: string; title: string; thumbnail: string };
}

interface ProfileContentProps {
  user: User;
  stats: Stats;
  recentPlays: PlayHistory[];
  recentFavorites: Favorite[];
  highScores: HighScore[];
}

export function ProfileContent({
  user,
  stats,
  recentPlays,
  recentFavorites,
  highScores,
}: ProfileContentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState(user.bio || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio }),
      });

      if (res.ok) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Profile Header */}
      <div className="mb-8 flex items-start gap-6">
        <div className="relative h-24 w-24 overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-cyan-500">
          {user.avatar ? (
            <Image
              src={user.avatar}
              alt={user.username}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-white">
              {user.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            {user.username}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Member since {new Date(user.createdAt).toLocaleDateString()}
          </p>

          {isEditing ? (
            <div className="mt-4 space-y-2">
              <Input
                placeholder="Write something about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={200}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                {user.bio || 'No bio yet'}
              </p>
              <Button
                size="sm"
                variant="ghost"
                className="mt-2"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-zinc-200 bg-white p-4 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-2xl font-bold text-zinc-900 dark:text-white">
            {stats.playHistoryCount}
          </div>
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            Games Played
          </div>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-2xl font-bold text-zinc-900 dark:text-white">
            {stats.favoriteCount}
          </div>
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            Favorites
          </div>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-2xl font-bold text-zinc-900 dark:text-white">
            {stats.reviewCount}
          </div>
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            Reviews
          </div>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-2xl font-bold text-zinc-900 dark:text-white">
            {stats.collectionCount}
          </div>
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            Collections
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Recently Played */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
            Recently Played
          </h2>
          {recentPlays.length > 0 ? (
            <div className="space-y-3">
              {recentPlays.map((play) => (
                <Link
                  key={play.id}
                  href={`/games/${play.game.slug}`}
                  className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white p-3 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                >
                  <div className="relative h-12 w-20 overflow-hidden rounded bg-zinc-200 dark:bg-zinc-700">
                    <Image
                      src={play.game.thumbnail}
                      alt={play.game.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium text-zinc-900 dark:text-white">
                      {play.game.title}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {new Date(play.lastPlayed).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No games played yet
            </p>
          )}
        </div>

        {/* Favorites */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
            Recent Favorites
          </h2>
          {recentFavorites.length > 0 ? (
            <div className="space-y-3">
              {recentFavorites.map((fav) => (
                <Link
                  key={fav.id}
                  href={`/games/${fav.game.slug}`}
                  className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white p-3 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                >
                  <div className="relative h-12 w-20 overflow-hidden rounded bg-zinc-200 dark:bg-zinc-700">
                    <Image
                      src={fav.game.thumbnail}
                      alt={fav.game.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium text-zinc-900 dark:text-white">
                      {fav.game.title}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Added {new Date(fav.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No favorites yet
            </p>
          )}
        </div>
      </div>

      {/* High Scores */}
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
          High Scores
        </h2>
        {highScores.length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-sm dark:border-zinc-800 dark:bg-zinc-800">
                  <th className="px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Game</th>
                  <th className="px-4 py-3 text-right font-medium text-zinc-500 dark:text-zinc-400">Score</th>
                  <th className="hidden px-4 py-3 text-right font-medium text-zinc-500 dark:text-zinc-400 sm:table-cell">Wave</th>
                  <th className="hidden px-4 py-3 text-right font-medium text-zinc-500 dark:text-zinc-400 md:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {highScores.map((score, index) => (
                  <tr
                    key={score.id}
                    className="border-b border-zinc-100 last:border-0 dark:border-zinc-800"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/games/${score.game.slug}`}
                        className="flex items-center gap-3 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        <div className="relative h-10 w-16 overflow-hidden rounded bg-zinc-200 dark:bg-zinc-700">
                          <Image
                            src={score.game.thumbnail}
                            alt={score.game.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          {index === 0 && <span className="text-lg">🏆</span>}
                          {index === 1 && <span className="text-lg">🥈</span>}
                          {index === 2 && <span className="text-lg">🥉</span>}
                          <span className="font-medium text-zinc-900 dark:text-white">
                            {score.game.title}
                          </span>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {score.score.toLocaleString()}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-right text-zinc-500 dark:text-zinc-400 sm:table-cell">
                      {score.wave ? `Wave ${score.wave}` : '-'}
                    </td>
                    <td className="hidden px-4 py-3 text-right text-zinc-500 dark:text-zinc-400 md:table-cell">
                      {new Date(score.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-lg border border-zinc-200 bg-white p-6 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-zinc-500 dark:text-zinc-400">No high scores yet</p>
            <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-500">
              Play some games to see your scores here!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
