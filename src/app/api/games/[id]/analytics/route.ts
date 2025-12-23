import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Track view or play
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { type } = body; // 'view' or 'play'

    if (type !== 'view' && type !== 'play') {
      return NextResponse.json(
        { error: 'Invalid type. Must be "view" or "play"' },
        { status: 400 }
      );
    }

    const updateField = type === 'view' ? 'viewCount' : 'playCount';

    const game = await prisma.game.update({
      where: { id },
      data: {
        [updateField]: { increment: 1 },
      },
      select: {
        id: true,
        viewCount: true,
        playCount: true,
      },
    });

    return NextResponse.json(game);
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to track analytics' },
      { status: 500 }
    );
  }
}

// Get analytics for a game
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const game = await prisma.game.findUnique({
      where: { id },
      select: {
        id: true,
        viewCount: true,
        playCount: true,
        _count: {
          select: {
            favorites: true,
            reviews: true,
          },
        },
      },
    });

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    return NextResponse.json({
      viewCount: game.viewCount,
      playCount: game.playCount,
      favoriteCount: game._count.favorites,
      reviewCount: game._count.reviews,
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to get analytics' },
      { status: 500 }
    );
  }
}
