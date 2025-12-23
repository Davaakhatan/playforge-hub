'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface CollectionGame {
  id: string;
  addedAt: string;
  game: {
    id: string;
    slug: string;
    title: string;
    shortDescription: string;
    thumbnail: string;
    tags: string;
  };
}

interface Collection {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  createdAt: string;
  user: {
    id: string;
    username: string;
    avatar: string | null;
  };
  games: CollectionGame[];
  _count: { games: number };
  isOwner: boolean;
}

export default function CollectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCollection = useCallback(async () => {
    try {
      const response = await fetch(`/api/collections/${id}`);
      if (!response.ok) {
        throw new Error('Collection not found');
      }
      const data = await response.json();
      setCollection(data);
    } catch (error) {
      console.error('Failed to fetch collection:', error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCollection();
  }, [fetchCollection]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this collection?')) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/collections/${id}`, { method: 'DELETE' });
      if (response.ok) {
        router.push('/collections');
      }
    } catch (error) {
      console.error('Failed to delete collection:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRemoveGame = async (gameId: string) => {
    try {
      const response = await fetch(`/api/collections/${id}/games?gameId=${gameId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchCollection();
      }
    } catch (error) {
      console.error('Failed to remove game:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-blue-500" />
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-zinc-100 mb-4">Collection Not Found</h1>
          <p className="text-zinc-400 mb-6">This collection doesn&apos;t exist or is private.</p>
          <Link href="/collections">
            <Button>Back to Collections</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/collections"
        className="mb-6 inline-flex items-center text-sm text-zinc-400 transition-colors hover:text-white"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="mr-1 h-4 w-4"
        >
          <path
            fillRule="evenodd"
            d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z"
            clipRule="evenodd"
          />
        </svg>
        Back to Collections
      </Link>

      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-zinc-100">{collection.name}</h1>
            {collection.isPublic && (
              <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs text-blue-400">
                Public
              </span>
            )}
          </div>
          {collection.description && (
            <p className="mt-2 text-zinc-400">{collection.description}</p>
          )}
          <p className="mt-2 text-sm text-zinc-500">
            By {collection.user.username} · {collection._count.games} games
          </p>
        </div>

        {collection.isOwner && (
          <div className="flex gap-2">
            <Button variant="danger" size="sm" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        )}
      </div>

      {/* Games Grid */}
      {collection.games.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {collection.games.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden transition-all hover:border-zinc-700"
            >
              <Link href={`/games/${item.game.slug}`}>
                <div className="aspect-video overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.game.thumbnail}
                    alt={item.game.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-zinc-100 group-hover:text-white">
                    {item.game.title}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-400 line-clamp-2">
                    {item.game.shortDescription}
                  </p>
                </div>
              </Link>

              {collection.isOwner && (
                <button
                  onClick={() => handleRemoveGame(item.game.id)}
                  className="absolute top-2 right-2 rounded-full bg-zinc-900/80 p-1.5 text-zinc-400 opacity-0 transition-opacity hover:bg-red-500 hover:text-white group-hover:opacity-100"
                  title="Remove from collection"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-4 w-4"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
            </div>
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
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-zinc-100">No games yet</h3>
          <p className="mt-2 text-zinc-400">
            Add games to this collection from their detail pages.
          </p>
          <Link href="/" className="mt-4 inline-block">
            <Button variant="secondary">Browse Games</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
