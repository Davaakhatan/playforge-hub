import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import { GameGrid } from '@/components/game';
import { SearchBar } from '@/components/search/SearchBar';
import { FilterSidebar, MobileFilterDrawer, SortSelect } from '@/components/filter';
import { GameGridSkeleton, SearchBarSkeleton } from '@/components/ui/Skeleton';
import type { GameEntry } from '@/types';

const GAMES_PER_PAGE = 12;

interface HomePageProps {
  searchParams: Promise<{
    search?: string;
    size?: string | string[];
    type?: string | string[];
    status?: string | string[];
    tag?: string | string[];
    sort?: string;
    page?: string;
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
  createdAt: Date;
}): GameEntry & { createdAt: Date } {
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
    createdAt: game.createdAt,
  };
}

type SortOption = 'featured' | 'newest' | 'oldest' | 'a-z' | 'z-a';

function sortGames(games: (GameEntry & { createdAt: Date })[], sort: SortOption) {
  const sorted = [...games];
  switch (sort) {
    case 'newest':
      return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    case 'oldest':
      return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    case 'a-z':
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case 'z-a':
      return sorted.sort((a, b) => b.title.localeCompare(a.title));
    case 'featured':
    default:
      return sorted.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }
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
    include: {
      reviews: {
        select: { rating: true },
      },
    },
  });

  // Filter by tags if provided (need to check JSON array)
  let filteredGames = games;
  if (params.tag && params.tag.length > 0) {
    filteredGames = games.filter((game) => {
      const gameTags = JSON.parse(game.tags) as string[];
      return params.tag!.some((t) => gameTags.includes(t));
    });
  }

  return filteredGames.map((game) => {
    const transformed = transformGame(game);
    const reviewCount = game.reviews.length;
    const averageRating = reviewCount > 0
      ? game.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : 0;
    return {
      ...transformed,
      averageRating,
      reviewCount,
    };
  });
}

async function getFeaturedGames() {
  const games = await prisma.game.findMany({
    where: { hidden: false, featured: true },
    orderBy: { createdAt: 'desc' },
    include: {
      reviews: {
        select: { rating: true },
      },
    },
  });
  return games.map((game) => {
    const transformed = transformGame(game);
    const reviewCount = game.reviews.length;
    const averageRating = reviewCount > 0
      ? game.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : 0;
    return {
      ...transformed,
      averageRating,
      reviewCount,
    };
  });
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

  const sort = (params.sort || 'featured') as SortOption;
  const currentPage = parseInt(params.page || '1', 10);

  const hasFilters = filterParams.search || filterParams.size.length > 0 ||
                     filterParams.type.length > 0 || filterParams.status.length > 0 ||
                     filterParams.tag.length > 0;

  const [allGames, featuredGames, tags] = await Promise.all([
    getGames(filterParams),
    hasFilters ? Promise.resolve([]) : getFeaturedGames(),
    getAllTags(),
  ]);

  // Sort and paginate
  const sortedGames = sortGames(allGames, sort);
  const totalGames = sortedGames.length;
  const totalPages = Math.ceil(totalGames / GAMES_PER_PAGE);
  const startIndex = (currentPage - 1) * GAMES_PER_PAGE;
  const paginatedGames = sortedGames.slice(startIndex, startIndex + GAMES_PER_PAGE);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="mb-8 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-zinc-900 md:text-5xl dark:text-white">
          Discover Amazing{' '}
          <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
            Indie Games
          </span>
        </h1>
        <p className="mx-auto mb-6 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
          Your gateway to the best indie games. Play instantly in your browser,
          download, or launch from external platforms.
        </p>
        <Suspense fallback={<SearchBarSkeleton />}>
          <SearchBar className="mx-auto max-w-xl" />
        </Suspense>
      </section>

      <div className="flex gap-8">
        {/* Filter Sidebar - Desktop */}
        <Suspense fallback={null}>
          <FilterSidebar tags={tags} className="hidden w-64 shrink-0 lg:block" />
        </Suspense>

        {/* Main Content */}
        <div className="flex-1">
          {/* Featured Games */}
          {!hasFilters && featuredGames.length > 0 && (
            <section className="mb-10">
              <h2 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-white">Featured Games</h2>
              <GameGrid games={featuredGames} />
            </section>
          )}

          {/* All Games */}
          <section>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                  {hasFilters ? 'Search Results' : 'All Games'}
                </h2>
                <span className="text-sm text-zinc-500">{totalGames} games</span>
              </div>
              <div className="flex items-center gap-3">
                {/* Mobile Filter Button */}
                <Suspense fallback={null}>
                  <MobileFilterDrawer tags={tags} />
                </Suspense>
                {/* Sort Select */}
                <Suspense fallback={null}>
                  <SortSelect />
                </Suspense>
              </div>
            </div>

            <Suspense fallback={<GameGridSkeleton />}>
              <GameGrid
                games={paginatedGames}
                emptyMessage={
                  hasFilters
                    ? 'No games match your search criteria.'
                    : 'No games available yet.'
                }
              />
            </Suspense>

            {/* Pagination */}
            {totalPages > 1 && (
              <PaginationWrapper
                currentPage={currentPage}
                totalPages={totalPages}
                searchParams={params}
              />
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

// Client component wrapper for pagination
function PaginationWrapper({
  currentPage,
  totalPages,
  searchParams,
}: {
  currentPage: number;
  totalPages: number;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (key === 'page') return;
      if (Array.isArray(value)) {
        value.forEach((v) => params.append(key, v));
      } else if (value) {
        params.set(key, value);
      }
    });
    if (page > 1) {
      params.set('page', String(page));
    }
    return `/?${params.toString()}`;
  };

  return (
    <nav className="mt-8 flex items-center justify-center gap-1">
      {/* Previous */}
      <a
        href={currentPage > 1 ? buildPageUrl(currentPage - 1) : '#'}
        className={`flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 ${
          currentPage === 1 ? 'pointer-events-none opacity-50' : ''
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z" clipRule="evenodd" />
        </svg>
      </a>

      {/* Page numbers */}
      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
        let page: number;
        if (totalPages <= 5) {
          page = i + 1;
        } else if (currentPage <= 3) {
          page = i + 1;
        } else if (currentPage >= totalPages - 2) {
          page = totalPages - 4 + i;
        } else {
          page = currentPage - 2 + i;
        }
        return (
          <a
            key={page}
            href={buildPageUrl(page)}
            className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
              page === currentPage
                ? 'bg-blue-500 text-white'
                : 'border border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
          >
            {page}
          </a>
        );
      })}

      {/* Next */}
      <a
        href={currentPage < totalPages ? buildPageUrl(currentPage + 1) : '#'}
        className={`flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 ${
          currentPage === totalPages ? 'pointer-events-none opacity-50' : ''
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 011.06-1.06l7.5 7.5z" clipRule="evenodd" />
        </svg>
      </a>
    </nav>
  );
}
