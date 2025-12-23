import type { GameEntry, FilterOptions } from '@/types';
import { prisma } from '@/lib/prisma';

// Transform database game to GameEntry type
function transformGame(game: {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  thumbnail: string;
  screenshots: string;
  tags: string;
  size: string;
  type: string;
  releaseStatus: string;
  url: string;
  platforms: string;
  developer: string | null;
  releaseDate: Date | null;
  version: string | null;
  featured: boolean;
  hidden: boolean;
}): GameEntry {
  return {
    id: game.id,
    slug: game.slug,
    title: game.title,
    shortDescription: game.shortDescription,
    longDescription: game.longDescription,
    thumbnail: game.thumbnail,
    screenshots: JSON.parse(game.screenshots),
    tags: JSON.parse(game.tags),
    size: game.size as GameEntry['size'],
    type: game.type as GameEntry['type'],
    releaseStatus: game.releaseStatus as GameEntry['releaseStatus'],
    url: game.url,
    platforms: JSON.parse(game.platforms),
    developer: game.developer ?? undefined,
    releaseDate: game.releaseDate?.toISOString().split('T')[0],
    version: game.version ?? undefined,
    featured: game.featured,
    hidden: game.hidden,
  };
}

// Get all non-hidden games
export async function getAllGames(): Promise<GameEntry[]> {
  const games = await prisma.game.findMany({
    where: { hidden: false },
  });
  return games.map(transformGame);
}

// Get a single game by slug
export async function getGameBySlug(slug: string): Promise<GameEntry | null> {
  const game = await prisma.game.findFirst({
    where: { slug, hidden: false },
  });
  return game ? transformGame(game) : null;
}

// Get all featured games
export async function getFeaturedGames(): Promise<GameEntry[]> {
  const games = await prisma.game.findMany({
    where: { featured: true, hidden: false },
  });
  return games.map(transformGame);
}

// Search games by query (searches title, tags, and description)
export async function searchGames(query: string): Promise<GameEntry[]> {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return getAllGames();

  const games = await prisma.game.findMany({
    where: {
      hidden: false,
      OR: [
        { title: { contains: lowerQuery, mode: 'insensitive' } },
        { shortDescription: { contains: lowerQuery, mode: 'insensitive' } },
        { tags: { contains: lowerQuery, mode: 'insensitive' } },
      ],
    },
  });
  return games.map(transformGame);
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
