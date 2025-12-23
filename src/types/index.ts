// Game Entry - Core schema for all games in the catalog
export interface GameEntry {
  // Identity
  id: string;
  slug: string;
  title: string;

  // Content
  shortDescription: string;
  longDescription: string;
  thumbnail: string;
  screenshots?: string[];

  // Classification
  tags: string[];
  size: 'mini' | 'medium' | 'big';
  type: 'web-embed' | 'external' | 'download';
  releaseStatus: 'prototype' | 'early-access' | 'released';

  // Launch
  url: string;
  platforms?: ('web' | 'windows' | 'mac' | 'linux')[];

  // Metadata
  developer?: string;
  releaseDate?: string;
  version?: string;

  // Feature Flags
  featured?: boolean;
  hidden?: boolean;

  // Stats (optional, populated when needed)
  averageRating?: number;
  reviewCount?: number;
}

// Local Library - Stored in localStorage
export interface LocalLibrary {
  favorites: string[];
  recentlyPlayed: RecentlyPlayedEntry[];
}

export interface RecentlyPlayedEntry {
  gameId: string;
  lastPlayed: string; // ISO timestamp
}

// Filter Options
export interface FilterOptions {
  size?: GameEntry['size'][];
  type?: GameEntry['type'][];
  tags?: string[];
  releaseStatus?: GameEntry['releaseStatus'][];
  search?: string;
}

// Sort Options
export type SortOption = 'alphabetical' | 'recently-added' | 'featured';

// Catalog API Interface - Stable shape for future migration
export interface CatalogAPI {
  getAllGames(): Promise<GameEntry[]>;
  getGameBySlug(slug: string): Promise<GameEntry | null>;
  searchGames(query: string): Promise<GameEntry[]>;
  filterGames(filters: FilterOptions): Promise<GameEntry[]>;
  getFeaturedGames(): Promise<GameEntry[]>;
}
