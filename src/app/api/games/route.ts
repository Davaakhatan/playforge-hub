import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import type { GameEntry } from '@/types';

const GAMES_PER_PAGE = 12;

type GameWithReviews = {
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
  reviews?: { rating: number }[];
};

// Helper to transform Prisma game to GameEntry
function transformGame(game: GameWithReviews): GameEntry & { createdAt: string; averageRating: number; reviewCount: number } {
  const reviewCount = game.reviews?.length || 0;
  const averageRating = reviewCount > 0
    ? game.reviews!.reduce((sum, r) => sum + r.rating, 0) / reviewCount
    : 0;

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
    createdAt: game.createdAt.toISOString(),
    averageRating,
    reviewCount,
  };
}

type SortOption = 'featured' | 'newest' | 'oldest' | 'a-z' | 'z-a' | 'top-rated' | 'most-reviewed';

function sortGames(
  games: (GameEntry & { createdAt: string; averageRating: number; reviewCount: number })[],
  sort: SortOption
) {
  const sorted = [...games];
  switch (sort) {
    case 'top-rated':
      return sorted.sort((a, b) => b.averageRating - a.averageRating);
    case 'most-reviewed':
      return sorted.sort((a, b) => b.reviewCount - a.reviewCount);
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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const slug = searchParams.get('slug');
    const size = searchParams.getAll('size');
    const type = searchParams.getAll('type');
    const status = searchParams.getAll('status');
    const tag = searchParams.getAll('tag');
    const featured = searchParams.get('featured');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const sort = (searchParams.get('sort') || 'featured') as SortOption;
    const paginate = searchParams.get('paginate') === 'true';

    // If slug is provided, return single game
    if (slug) {
      const game = await prisma.game.findUnique({
        where: { slug, hidden: false },
        include: { reviews: { select: { rating: true } } },
      });
      if (!game) {
        return NextResponse.json({ error: 'Game not found' }, { status: 404 });
      }
      return NextResponse.json(transformGame(game as GameWithReviews));
    }

    // Build where clause
    const where: Record<string, unknown> = { hidden: false };

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { shortDescription: { contains: search } },
        { tags: { contains: search } },
      ];
    }

    if (size.length > 0) {
      where.size = { in: size };
    }

    if (type.length > 0) {
      where.type = { in: type };
    }

    if (status.length > 0) {
      where.releaseStatus = { in: status };
    }

    if (featured === 'true') {
      where.featured = true;
    }

    const games = await prisma.game.findMany({
      where,
      include: { reviews: { select: { rating: true } } },
    });

    // Filter by tags if provided
    let filteredGames = games;
    if (tag.length > 0) {
      filteredGames = games.filter((game) => {
        const gameTags = JSON.parse(game.tags) as string[];
        return tag.some((t) => gameTags.includes(t));
      });
    }

    const transformedGames = filteredGames.map((g) => transformGame(g as GameWithReviews));
    const sortedGames = sortGames(transformedGames, sort);

    // If pagination requested, return paginated response
    if (paginate) {
      const totalGames = sortedGames.length;
      const totalPages = Math.ceil(totalGames / GAMES_PER_PAGE);
      const startIndex = (page - 1) * GAMES_PER_PAGE;
      const paginatedGames = sortedGames.slice(startIndex, startIndex + GAMES_PER_PAGE);

      return NextResponse.json({
        games: paginatedGames,
        pagination: {
          page,
          totalPages,
          totalGames,
          hasMore: page < totalPages,
        },
      });
    }

    return NextResponse.json(sortedGames);
  } catch (error) {
    console.error('Get games error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const game = await prisma.game.create({
      data: {
        slug: body.slug,
        title: body.title,
        shortDescription: body.shortDescription,
        longDescription: body.longDescription,
        thumbnail: body.thumbnail,
        screenshots: JSON.stringify(body.screenshots || []),
        tags: JSON.stringify(body.tags || []),
        size: body.size,
        type: body.type,
        releaseStatus: body.releaseStatus,
        url: body.url,
        platforms: JSON.stringify(body.platforms || []),
        developer: body.developer,
        releaseDate: body.releaseDate ? new Date(body.releaseDate) : null,
        version: body.version,
        featured: body.featured || false,
        hidden: body.hidden || false,
      },
    });

    return NextResponse.json(transformGame(game), { status: 201 });
  } catch (error) {
    console.error('Create game error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
