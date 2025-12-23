'use client';

import type { LocalLibrary, RecentlyPlayedEntry } from '@/types';

const STORAGE_KEY = 'playforge-library';
const MAX_RECENT_GAMES = 20;

// Get library from localStorage
export function getLibrary(): LocalLibrary {
  if (typeof window === 'undefined') {
    return { favorites: [], recentlyPlayed: [] };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as LocalLibrary;
    }
  } catch {
    console.error('Failed to parse library from localStorage');
  }

  return { favorites: [], recentlyPlayed: [] };
}

// Save library to localStorage
function saveLibrary(library: LocalLibrary): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(library));
  } catch {
    console.error('Failed to save library to localStorage');
  }
}

// Check if a game is favorited
export function isFavorite(gameId: string): boolean {
  const library = getLibrary();
  return library.favorites.includes(gameId);
}

// Add a game to favorites
export function addFavorite(gameId: string): void {
  const library = getLibrary();
  if (!library.favorites.includes(gameId)) {
    library.favorites.push(gameId);
    saveLibrary(library);
  }
}

// Remove a game from favorites
export function removeFavorite(gameId: string): void {
  const library = getLibrary();
  library.favorites = library.favorites.filter(id => id !== gameId);
  saveLibrary(library);
}

// Toggle favorite status
export function toggleFavorite(gameId: string): boolean {
  if (isFavorite(gameId)) {
    removeFavorite(gameId);
    return false;
  } else {
    addFavorite(gameId);
    return true;
  }
}

// Get all favorite game IDs
export function getFavorites(): string[] {
  return getLibrary().favorites;
}

// Record that a game was played
export function recordPlay(gameId: string): void {
  const library = getLibrary();
  const now = new Date().toISOString();

  // Remove existing entry for this game
  library.recentlyPlayed = library.recentlyPlayed.filter(
    entry => entry.gameId !== gameId
  );

  // Add to the beginning
  library.recentlyPlayed.unshift({ gameId, lastPlayed: now });

  // Keep only the most recent games
  library.recentlyPlayed = library.recentlyPlayed.slice(0, MAX_RECENT_GAMES);

  saveLibrary(library);
}

// Get recently played games
export function getRecentlyPlayed(): RecentlyPlayedEntry[] {
  return getLibrary().recentlyPlayed;
}

// Clear all library data
export function clearLibrary(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
