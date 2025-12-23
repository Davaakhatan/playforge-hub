import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);

    if (!query.trim()) {
      return NextResponse.json({ games: [] });
    }

    const games = await prisma.game.findMany({
      where: {
        hidden: false,
        OR: [
          { title: { contains: query } },
          { shortDescription: { contains: query } },
          { tags: { contains: query } },
          { developer: { contains: query } },
        ],
      },
      select: {
        id: true,
        slug: true,
        title: true,
        thumbnail: true,
        shortDescription: true,
      },
      orderBy: [
        { featured: 'desc' },
        { playCount: 'desc' },
        { viewCount: 'desc' },
      ],
      take: limit,
    });

    return NextResponse.json(
      { games },
      {
        headers: {
          'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}
