import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import { GameGrid } from '@/components/game';
import { SearchBar } from '@/components/search/SearchBar';
import { FilterSidebar } from '@/components/filter/FilterSidebar';
import type { GameEntry } from '@/types';

interface HomePageProps {
  searchParams: Promise<{
    search?: string;
    size?: string | string[];
    type?: string | string[];
    status?: string | string[];
    tag?: string | string[];
  }>;
}

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

async function getGames(params: {
  search?: string;
  size?: string[];
  type?: string[];
  status?: string[];
  tag?: string[];
}) {
  const where: Record<string, unknown> = { hidden: false };

  if (params.search) {
    where.OR = [
      { title: { contains: params.search } },
      { shortDescription: { contains: params.search } },
      { tags: { contains: params.search } },
    ];
  }

  if (params.size && params.size.length > 0) {
    where.size = { in: params.size };
  }

  if (params.type && params.type.length > 0) {
    where.type = { in: params.type };
  }

  if (params.status && params.status.length > 0) {
    where.releaseStatus = { in: params.status };
  }

  const games = await prisma.game.findMany({
    where,
    orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
  });

  // Filter by tags if provided (need to check JSON array)
  let filteredGames = games;
  if (params.tag && params.tag.length > 0) {
    filteredGames = games.filter((game) => {
      const gameTags = JSON.parse(game.tags) as string[];
      return params.tag!.some((t) => gameTags.includes(t));
    });
  }

  return filteredGames.map(transformGame);
}

async function getFeaturedGames() {
  const games = await prisma.game.findMany({
    where: { hidden: false, featured: true },
    orderBy: { createdAt: 'desc' },
  });
  return games.map(transformGame);
}

async function getAllTags() {
  const games = await prisma.game.findMany({
    where: { hidden: false },
    select: { tags: true },
  });
  const tagSet = new Set<string>();
  games.forEach((game) => {
    const tags = JSON.parse(game.tags) as string[];
    tags.forEach((tag) => tagSet.add(tag));
  });
  return Array.from(tagSet).sort();
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;

  const toArray = (value?: string | string[]) => {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  };

  const filterParams = {
    search: params.search,
    size: toArray(params.size),
    type: toArray(params.type),
    status: toArray(params.status),
    tag: toArray(params.tag),
  };

  const hasFilters = filterParams.search || filterParams.size.length > 0 ||
                     filterParams.type.length > 0 || filterParams.status.length > 0 ||
                     filterParams.tag.length > 0;

  const [games, featuredGames, tags] = await Promise.all([
    getGames(filterParams),
    hasFilters ? Promise.resolve([]) : getFeaturedGames(),
    getAllTags(),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="mb-8 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-white md:text-5xl">
          Discover Amazing{' '}
          <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
            Indie Games
          </span>
        </h1>
        <p className="mx-auto mb-6 max-w-2xl text-lg text-zinc-400">
          Your gateway to the best indie games. Play instantly in your browser,
          download, or launch from external platforms.
        </p>
        <Suspense fallback={<div className="h-12 w-full max-w-xl mx-auto rounded-xl bg-zinc-800 animate-pulse" />}>
          <SearchBar className="mx-auto max-w-xl" />
        </Suspense>
      </section>

      <div className="flex gap-8">
        {/* Filter Sidebar */}
        <Suspense fallback={null}>
          <FilterSidebar tags={tags} className="hidden w-64 shrink-0 lg:block" />
        </Suspense>

        {/* Main Content */}
        <div className="flex-1">
          {/* Featured Games */}
          {!hasFilters && featuredGames.length > 0 && (
            <section className="mb-10">
              <h2 className="mb-6 text-2xl font-bold text-white">Featured Games</h2>
              <GameGrid games={featuredGames} />
            </section>
          )}

          {/* All Games */}
          <section>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">
                {hasFilters ? 'Search Results' : 'All Games'}
              </h2>
              <span className="text-sm text-zinc-500">{games.length} games</span>
            </div>
            <GameGrid
              games={games}
              emptyMessage={
                hasFilters
                  ? 'No games match your search criteria.'
                  : 'No games available yet.'
              }
            />
          </section>
        </div>
      </div>
    </div>
  );
}
