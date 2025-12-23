import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { validateSession } from '@/lib/auth';

// GET - Get analytics data (admin only)
export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await validateSession(sessionToken);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get counts
    const [
      totalUsers,
      totalGames,
      totalComments,
      totalFavorites,
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
      activeUsersThisWeek,
      topGames,
      recentUsers,
      pendingReports,
      gamesByType,
      usersByLevel,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.game.count({ where: { hidden: false } }),
      prisma.comment.count({ where: { isHidden: false } }),
      prisma.favorite.count(),
      prisma.user.count({ where: { createdAt: { gte: today } } }),
      prisma.user.count({ where: { createdAt: { gte: thisWeek } } }),
      prisma.user.count({ where: { createdAt: { gte: thisMonth } } }),
      prisma.session.groupBy({
        by: ['userId'],
        where: { createdAt: { gte: thisWeek } },
        _count: true,
      }),
      prisma.game.findMany({
        where: { hidden: false },
        select: {
          id: true,
          title: true,
          slug: true,
          viewCount: true,
          playCount: true,
          _count: {
            select: { favorites: true },
          },
        },
        orderBy: { playCount: 'desc' },
        take: 10,
      }),
      prisma.user.findMany({
        select: {
          id: true,
          username: true,
          email: true,
          createdAt: true,
          _count: {
            select: { playHistory: true, favorites: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.report.count({ where: { status: 'pending' } }),
      prisma.game.groupBy({
        by: ['type'],
        where: { hidden: false },
        _count: true,
      }),
      prisma.user.groupBy({
        by: ['level'],
        _count: true,
        orderBy: { level: 'asc' },
      }),
    ]);

    // Calculate daily signups for the last 7 days
    const dailySignups = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
      const count = await prisma.user.count({
        where: {
          createdAt: {
            gte: date,
            lt: nextDate,
          },
        },
      });
      dailySignups.push({
        date: date.toISOString().split('T')[0],
        count,
      });
    }

    return NextResponse.json({
      overview: {
        totalUsers,
        totalGames,
        totalComments,
        totalFavorites,
        newUsersToday,
        newUsersThisWeek,
        newUsersThisMonth,
        activeUsersThisWeek: activeUsersThisWeek.length,
        pendingReports,
      },
      topGames: topGames.map((g) => ({
        ...g,
        favoriteCount: g._count.favorites,
      })),
      recentUsers: recentUsers.map((u) => ({
        ...u,
        gamesPlayed: u._count.playHistory,
        favorites: u._count.favorites,
      })),
      charts: {
        dailySignups,
        gamesByType: gamesByType.map((g) => ({
          type: g.type,
          count: g._count,
        })),
        usersByLevel: usersByLevel.map((u) => ({
          level: u.level,
          count: u._count,
        })),
      },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
