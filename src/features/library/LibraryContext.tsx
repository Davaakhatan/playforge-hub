'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { RecentlyPlayedEntry } from '@/types';
import {
  getLibrary,
  addFavorite,
  removeFavorite,
  recordPlay as recordPlayToStorage,
} from './index';

interface LibraryContextType {
  favorites: string[];
  recentlyPlayed: RecentlyPlayedEntry[];
  isFavorite: (gameId: string) => boolean;
  toggleFavorite: (gameId: string) => void;
  recordPlay: (gameId: string) => void;
}

const LibraryContext = createContext<LibraryContextType | null>(null);

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<RecentlyPlayedEntry[]>([]);

  // Load library from localStorage on mount
  useEffect(() => {
    const library = getLibrary();
    setFavorites(library.favorites);
    setRecentlyPlayed(library.recentlyPlayed);
  }, []);

  // Sync with other tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'playforge-library') {
        const library = getLibrary();
        setFavorites(library.favorites);
        setRecentlyPlayed(library.recentlyPlayed);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const isFavorite = useCallback(
    (gameId: string) => favorites.includes(gameId),
    [favorites]
  );

  const toggleFavorite = useCallback((gameId: string) => {
    setFavorites(prev => {
      if (prev.includes(gameId)) {
        removeFavorite(gameId);
        return prev.filter(id => id !== gameId);
      } else {
        addFavorite(gameId);
        return [...prev, gameId];
      }
    });
  }, []);

  const recordPlay = useCallback((gameId: string) => {
    recordPlayToStorage(gameId);
    setRecentlyPlayed(prev => {
      const filtered = prev.filter(entry => entry.gameId !== gameId);
      return [{ gameId, lastPlayed: new Date().toISOString() }, ...filtered].slice(0, 20);
    });
  }, []);

  return (
    <LibraryContext.Provider
      value={{
        favorites,
        recentlyPlayed,
        isFavorite,
        toggleFavorite,
        recordPlay,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
}
