import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import type { GameEntry } from '@/types';

// Helper to transform Prisma game to GameEntry
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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const slug = searchParams.get('slug');
    const size = searchParams.getAll('size');
    const type = searchParams.getAll('type');
    const status = searchParams.getAll('status');
    const featured = searchParams.get('featured');

    // If slug is provided, return single game
    if (slug) {
      const game = await prisma.game.findUnique({
        where: { slug, hidden: false },
      });
      if (!game) {
        return NextResponse.json({ error: 'Game not found' }, { status: 404 });
      }
      return NextResponse.json(transformGame(game));
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
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json(games.map(transformGame));
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
