import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const history = await prisma.playHistory.findMany({
      where: { userId: user.id },
      orderBy: { lastPlayed: 'desc' },
      take: 20,
    });

    return NextResponse.json(
      history.map((h) => ({
        gameId: h.gameId,
        lastPlayed: h.lastPlayed.toISOString(),
      }))
    );
  } catch (error) {
    console.error('Get history error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
