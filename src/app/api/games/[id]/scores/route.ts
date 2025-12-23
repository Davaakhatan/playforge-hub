import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/games/[id]/scores - Get leaderboard for a game
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Verify game exists
    const game = await prisma.game.findUnique({
      where: { id },
      select: { id: true, slug: true, title: true },
    });

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    // Get top scores
    const scores = await prisma.gameScore.findMany({
      where: { gameId: id },
      orderBy: { score: 'desc' },
      take: limit,
      skip: offset,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    // Get total count for pagination
    const totalCount = await prisma.gameScore.count({
      where: { gameId: id },
    });

    // Transform scores for response
    const leaderboard = scores.map((entry, index) => ({
      rank: offset + index + 1,
      id: entry.id,
      score: entry.score,
      wave: entry.wave,
      playerName: entry.user?.username || entry.playerName || 'Anonymous',
      userId: entry.userId,
      avatar: entry.user?.avatar,
      createdAt: entry.createdAt.toISOString(),
    }));

    return NextResponse.json({
      game: {
        id: game.id,
        slug: game.slug,
        title: game.title,
      },
      leaderboard,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
    });
  } catch (error) {
    console.error('Get game scores error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/games/[id]/scores - Submit a new score
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate required fields
    if (typeof body.score !== 'number' || body.score < 0) {
      return NextResponse.json(
        { error: 'Invalid score' },
        { status: 400 }
      );
    }

    // Verify game exists
    const game = await prisma.game.findUnique({
      where: { id },
      select: { id: true, slug: true, title: true },
    });

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    // Try to get current user (optional - allows anonymous scores)
    const user = await getCurrentUser();

    // Create the score entry
    const scoreEntry = await prisma.gameScore.create({
      data: {
        gameId: id,
        userId: user?.id || null,
        score: body.score,
        wave: body.wave || null,
        playerName: user?.username || body.playerName || 'Anonymous',
        metadata: body.metadata ? JSON.stringify(body.metadata) : null,
      },
    });

    // Get the rank of this score
    const rank = await prisma.gameScore.count({
      where: {
        gameId: id,
        score: { gt: scoreEntry.score },
      },
    }) + 1;

    // Get user's personal best for this game
    let personalBest = null;
    if (user) {
      const best = await prisma.gameScore.findFirst({
        where: {
          gameId: id,
          userId: user.id,
        },
        orderBy: { score: 'desc' },
      });
      personalBest = best?.score || scoreEntry.score;
    }

    // Check if this is a new high score (top 1)
    const isHighScore = rank === 1;

    return NextResponse.json({
      success: true,
      entry: {
        id: scoreEntry.id,
        score: scoreEntry.score,
        wave: scoreEntry.wave,
        rank,
        isHighScore,
        personalBest,
        createdAt: scoreEntry.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Submit game score error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
