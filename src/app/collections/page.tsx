'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface Collection {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  _count: { games: number };
  games: Array<{
    game: {
      id: string;
      slug: string;
      title: string;
      thumbnail: string;
    };
  }>;
}

export default function CollectionsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCollections();
    } else if (!authLoading) {
      setIsLoading(false);
    }
  }, [user, authLoading]);

  const fetchCollections = async () => {
    try {
      const response = await fetch('/api/collections');
      const data = await response.json();
      setCollections(data);
    } catch (error) {
      console.error('Failed to fetch collections:', error);
    } finally {
      setIsLoading(false);
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
          <p className="text-zinc-400 mb-6">Please sign in to view your collections.</p>
          <Link href="/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-zinc-100">My Collections</h1>
        <Link href="/collections/new">
          <Button>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="mr-2 h-5 w-5"
            >
              <path
                fillRule="evenodd"
                d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z"
                clipRule="evenodd"
              />
            </svg>
            New Collection
          </Button>
        </Link>
      </div>

      {collections.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={`/collections/${collection.id}`}
              className="group rounded-xl border border-zinc-800 bg-zinc-900 p-4 transition-all hover:border-zinc-700 hover:shadow-lg"
            >
              {/* Thumbnail Grid */}
              <div className="mb-4 grid grid-cols-2 gap-1 overflow-hidden rounded-lg aspect-video bg-zinc-800">
                {collection.games.slice(0, 4).map((item, index) => (
                  <div key={index} className="relative aspect-video">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.game.thumbnail}
                      alt={item.game.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
                {Array.from({ length: Math.max(0, 4 - collection.games.length) }).map((_, i) => (
                  <div key={`empty-${i}`} className="bg-zinc-700" />
                ))}
              </div>

              {/* Info */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-zinc-100 group-hover:text-white">
                    {collection.name}
                  </h3>
                  <p className="text-sm text-zinc-500">
                    {collection._count.games} {collection._count.games === 1 ? 'game' : 'games'}
                  </p>
                </div>
                {collection.isPublic && (
                  <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs text-blue-400">
                    Public
                  </span>
                )}
              </div>

              {collection.description && (
                <p className="mt-2 text-sm text-zinc-400 line-clamp-2">
                  {collection.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 rounded-xl border border-zinc-800 bg-zinc-900">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mx-auto h-12 w-12 text-zinc-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-zinc-100">No collections yet</h3>
          <p className="mt-2 text-zinc-400">
            Create your first collection to organize your favorite games.
          </p>
          <Link href="/collections/new" className="mt-4 inline-block">
            <Button>Create Collection</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
