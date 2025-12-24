'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface Collection {
  id: string;
  name: string;
  hasGame: boolean;
}

interface AddToCollectionButtonProps {
  gameId: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function AddToCollectionButton({ gameId, className, size = 'md' }: AddToCollectionButtonProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchCollections = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/collections?gameId=${gameId}`);
      if (response.ok) {
        const data = await response.json();
        setCollections(data);
      }
    } catch (error) {
      console.error('Failed to fetch collections:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async () => {
    if (!user) return;
    if (!isOpen) {
      fetchCollections();
    }
    setIsOpen(!isOpen);
  };

  const handleCollectionToggle = async (collectionId: string, hasGame: boolean) => {
    setUpdating(collectionId);
    try {
      if (hasGame) {
        await fetch(`/api/collections/${collectionId}/games?gameId=${gameId}`, {
          method: 'DELETE',
        });
      } else {
        await fetch(`/api/collections/${collectionId}/games`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gameId }),
        });
      }
      setCollections(prev =>
        prev.map(c => c.id === collectionId ? { ...c, hasGame: !hasGame } : c)
      );
    } catch (error) {
      console.error('Failed to update collection:', error);
    } finally {
      setUpdating(null);
    }
  };

  if (!user) {
    return (
      <Link href="/login">
        <Button variant="ghost" size={size} className={className} aria-label="Add to collection">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5v6m3-3H9m4.06-7.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
          </svg>
        </Button>
      </Link>
    );
  }

  const hasAnyGame = collections.some(c => c.hasGame);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size={size}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleToggle();
        }}
        className={cn('group/col', hasAnyGame && 'text-emerald-500 hover:text-emerald-400', className)}
        aria-label="Add to collection"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={hasAnyGame ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} className="h-5 w-5 transition-transform group-hover/col:scale-110">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5v6m3-3H9m4.06-7.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
        </svg>
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border border-zinc-700 bg-zinc-800 shadow-xl">
          <div className="border-b border-zinc-700 px-4 py-2">
            <h4 className="font-medium text-zinc-100">Add to Collection</h4>
          </div>
          <div className="max-h-64 overflow-y-auto p-2">
            {isLoading ? (
              <div className="flex justify-center py-4">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-600 border-t-blue-500" />
              </div>
            ) : collections.length > 0 ? (
              <div className="space-y-1">
                {collections.map((collection) => (
                  <button
                    key={collection.id}
                    onClick={() => handleCollectionToggle(collection.id, collection.hasGame)}
                    disabled={updating === collection.id}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-zinc-700 disabled:opacity-50"
                  >
                    <div className={cn(
                      'flex h-5 w-5 items-center justify-center rounded border',
                      collection.hasGame ? 'border-emerald-500 bg-emerald-500' : 'border-zinc-600'
                    )}>
                      {collection.hasGame && (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3 text-white">
                          <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className="text-zinc-100">{collection.name}</span>
                    {updating === collection.id && (
                      <div className="ml-auto h-4 w-4 animate-spin rounded-full border-2 border-zinc-600 border-t-blue-500" />
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center text-sm text-zinc-400">No collections yet</div>
            )}
          </div>
          <div className="border-t border-zinc-700 p-2">
            <Link href="/collections/new" className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-blue-400 transition-colors hover:bg-zinc-700">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
              </svg>
              Create New Collection
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
