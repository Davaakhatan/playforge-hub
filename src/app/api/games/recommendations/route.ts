import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 20);
    const gameId = searchParams.get('gameId');

    const user = await getCurrentUser();

    // If a specific game is provided, find similar games
    if (gameId) {
      const cacheKey = `recommendations:game:${gameId}:${limit}`;
      const cached = cache.get<unknown[]>(cacheKey);
      if (cached) {
        return NextResponse.json({ games: cached });
      }

      const game = await prisma.game.findUnique({
        where: { id: gameId },
        select: { tags: true, size: true, type: true },
      });

      if (!game) {
        return NextResponse.json({ games: [] });
      }

      const tags = JSON.parse(game.tags) as string[];

      // Find games with similar tags
      const recommendations = await prisma.game.findMany({
        where: {
          id: { not: gameId },
          hidden: false,
          OR: tags.map((tag) => ({ tags: { contains: tag } })),
        },
        select: {
          id: true,
          slug: true,
          title: true,
          thumbnail: true,
          shortDescription: true,
          tags: true,
        },
        orderBy: { playCount: 'desc' },
        take: limit,
      });

      cache.set(cacheKey, recommendations, 300); // 5 min cache
      return NextResponse.json({ games: recommendations });
    }

    // Personalized recommendations based on user history
    if (user) {
      const cacheKey = `recommendations:user:${user.id}:${limit}`;
      const cached = cache.get<unknown[]>(cacheKey);
      if (cached) {
        return NextResponse.json({ games: cached });
      }

      // Get user's favorite and played game tags
      const [favorites, playHistory] = await Promise.all([
        prisma.favorite.findMany({
          where: { userId: user.id },
          include: { game: { select: { tags: true } } },
          take: 10,
        }),
        prisma.playHistory.findMany({
          where: { userId: user.id },
          include: { game: { select: { tags: true } } },
          orderBy: { lastPlayed: 'desc' },
          take: 10,
        }),
      ]);

      const allTags = new Set<string>();
      const playedGameIds = new Set<string>();

      [...favorites, ...playHistory].forEach((item) => {
        playedGameIds.add(item.gameId);
        const tags = JSON.parse(item.game.tags) as string[];
        tags.forEach((tag) => allTags.add(tag));
      });

      if (allTags.size === 0) {
        // No history, return popular games
        const popular = await prisma.game.findMany({
          where: { hidden: false },
          select: {
            id: true,
            slug: true,
            title: true,
            thumbnail: true,
            shortDescription: true,
          },
          orderBy: { playCount: 'desc' },
          take: limit,
        });
        return NextResponse.json({ games: popular });
      }

      const tagArray = Array.from(allTags);
      const recommendations = await prisma.game.findMany({
        where: {
          id: { notIn: Array.from(playedGameIds) },
          hidden: false,
          OR: tagArray.map((tag) => ({ tags: { contains: tag } })),
        },
        select: {
          id: true,
          slug: true,
          title: true,
          thumbnail: true,
          shortDescription: true,
        },
        orderBy: { playCount: 'desc' },
        take: limit,
      });

      cache.set(cacheKey, recommendations, 300);
      return NextResponse.json({ games: recommendations });
    }

    // Default: return popular games
    const cacheKey = `recommendations:popular:${limit}`;
    const cached = cache.get<unknown[]>(cacheKey);
    if (cached) {
      return NextResponse.json({ games: cached });
    }

    const popular = await prisma.game.findMany({
      where: { hidden: false },
      select: {
        id: true,
        slug: true,
        title: true,
        thumbnail: true,
        shortDescription: true,
      },
      orderBy: { playCount: 'desc' },
      take: limit,
    });

    cache.set(cacheKey, popular, 300);
    return NextResponse.json({ games: popular });
  } catch (error) {
    console.error('Recommendations error:', error);
    return NextResponse.json({ error: 'Failed to get recommendations' }, { status: 500 });
  }
}
