import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [totalGames, totalUsers, featuredGames, recentGames, recentUsers] =
      await Promise.all([
        prisma.game.count({ where: { hidden: false } }),
        prisma.user.count(),
        prisma.game.count({ where: { featured: true, hidden: false } }),
        prisma.game.findMany({
          where: { hidden: false },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: { id: true, title: true, createdAt: true },
        }),
        prisma.user.findMany({
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: { id: true, username: true, createdAt: true },
        }),
      ]);

    return NextResponse.json({
      totalGames,
      totalUsers,
      featuredGames,
      recentGames,
      recentUsers,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
