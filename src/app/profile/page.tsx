'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { Button } from '@/components/ui/Button';
import { StarRating } from '@/components/review';
import Link from 'next/link';

interface Review {
  id: string;
  rating: number;
  title: string | null;
  content: string | null;
  createdAt: string;
  game: {
    id: string;
    slug: string;
    title: string;
    thumbnail: string;
  };
}

interface Collection {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  _count: { games: number };
}

interface ProfileData {
  id: string;
  username: string;
  avatar: string | null;
  bio: string | null;
  createdAt: string;
  stats: {
    reviews: number;
    favorites: number;
    collections: number;
  };
  recentReviews: Review[];
  collections: Collection[];
}

export default function ProfilePage() {
  const { user, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    try {
      const response = await fetch(`/api/users/${user.username}`);
      const data = await response.json();
      setProfile(data);
      setBio(data.bio || '');
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user, fetchProfile]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio }),
      });

      if (response.ok) {
        setIsEditing(false);
        fetchProfile();
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-blue-500" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-zinc-100 mb-4">Sign In Required</h1>
          <p className="text-zinc-400 mb-6">Please sign in to view your profile.</p>
          <Link href="/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-zinc-400">Failed to load profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="mb-8 rounded-xl bg-zinc-900 p-6">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Avatar */}
          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-4xl font-bold text-white">
            {profile.username[0].toUpperCase()}
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-zinc-100">{profile.username}</h1>
            <p className="text-sm text-zinc-500">
              Member since {new Date(profile.createdAt).toLocaleDateString()}
            </p>

            {isEditing ? (
              <div className="mt-4 space-y-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                    Bio
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    rows={3}
                    className="flex w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <p className="mt-2 text-zinc-400">
                  {profile.bio || 'No bio yet.'}
                </p>
                <Button
                  size="sm"
                  variant="secondary"
                  className="mt-3"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="flex gap-6 sm:gap-8">
            <div className="text-center">
              <p className="text-2xl font-bold text-zinc-100">{profile.stats.reviews}</p>
              <p className="text-sm text-zinc-500">Reviews</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-zinc-100">{profile.stats.favorites}</p>
              <p className="text-sm text-zinc-500">Favorites</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-zinc-100">{profile.stats.collections}</p>
              <p className="text-sm text-zinc-500">Collections</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Recent Reviews */}
        <div>
          <h2 className="mb-4 text-xl font-bold text-zinc-100">Recent Reviews</h2>
          {profile.recentReviews.length > 0 ? (
            <div className="space-y-3">
              {profile.recentReviews.map((review) => (
                <Link
                  key={review.id}
                  href={`/games/${review.game.slug}`}
                  className="block rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 transition-colors hover:border-zinc-700"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded bg-zinc-800 overflow-hidden flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={review.game.thumbnail}
                        alt={review.game.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-zinc-100 truncate">
                        {review.game.title}
                      </p>
                      <div className="flex items-center gap-2">
                        <StarRating rating={review.rating} size="sm" />
                        <span className="text-xs text-zinc-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  {review.title && (
                    <p className="mt-2 text-sm text-zinc-400 truncate">{review.title}</p>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-zinc-500 text-center py-8">No reviews yet.</p>
          )}
        </div>

        {/* Collections */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-zinc-100">Collections</h2>
            <Link href="/collections/new">
              <Button size="sm" variant="secondary">
                New Collection
              </Button>
            </Link>
          </div>
          {profile.collections.length > 0 ? (
            <div className="space-y-3">
              {profile.collections.map((collection) => (
                <Link
                  key={collection.id}
                  href={`/collections/${collection.id}`}
                  className="block rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 transition-colors hover:border-zinc-700"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-zinc-100">{collection.name}</p>
                      {collection.description && (
                        <p className="text-sm text-zinc-400 truncate">
                          {collection.description}
                        </p>
                      )}
                    </div>
                    <span className="text-sm text-zinc-500">
                      {collection._count.games} games
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-zinc-500 text-center py-8">No collections yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
