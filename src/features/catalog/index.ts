import type { GameEntry, FilterOptions } from '@/types';
import catalogData from '../../../catalog/games.json';

// Type assertion for JSON import
const games = catalogData as GameEntry[];

// Get all non-hidden games
export async function getAllGames(): Promise<GameEntry[]> {
  return games.filter(game => !game.hidden);
}

// Get a single game by slug
export async function getGameBySlug(slug: string): Promise<GameEntry | null> {
  const game = games.find(g => g.slug === slug && !g.hidden);
  return game ?? null;
}

// Get all featured games
export async function getFeaturedGames(): Promise<GameEntry[]> {
  return games.filter(game => game.featured && !game.hidden);
}

// Search games by query (searches title, tags, and description)
export async function searchGames(query: string): Promise<GameEntry[]> {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return getAllGames();

  return games.filter(game => {
    if (game.hidden) return false;

    const titleMatch = game.title.toLowerCase().includes(lowerQuery);
    const descMatch = game.shortDescription.toLowerCase().includes(lowerQuery);
    const tagMatch = game.tags.some(tag => tag.toLowerCase().includes(lowerQuery));

    return titleMatch || descMatch || tagMatch;
  });
}

// Filter games by various criteria
export async function filterGames(filters: FilterOptions): Promise<GameEntry[]> {
  let result = await getAllGames();

  // Apply search filter
  if (filters.search) {
    result = await searchGames(filters.search);
  }

  // Apply size filter
  if (filters.size && filters.size.length > 0) {
    result = result.filter(game => filters.size!.includes(game.size));
  }

  // Apply type filter
  if (filters.type && filters.type.length > 0) {
    result = result.filter(game => filters.type!.includes(game.type));
  }

  // Apply tag filter (game must have at least one matching tag)
  if (filters.tags && filters.tags.length > 0) {
    result = result.filter(game =>
      game.tags.some(tag => filters.tags!.includes(tag))
    );
  }

  // Apply release status filter
  if (filters.releaseStatus && filters.releaseStatus.length > 0) {
    result = result.filter(game =>
      filters.releaseStatus!.includes(game.releaseStatus)
    );
  }

  return result;
}

// Get all unique tags from the catalog
export async function getAllTags(): Promise<string[]> {
  const allGames = await getAllGames();
  const tagSet = new Set<string>();
  allGames.forEach(game => game.tags.forEach(tag => tagSet.add(tag)));
  return Array.from(tagSet).sort();
}
