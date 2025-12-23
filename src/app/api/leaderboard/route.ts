import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type LeaderboardType = 'xp' | 'level' | 'games' | 'achievements';

// GET - Get leaderboard data
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const type = (url.searchParams.get('type') || 'xp') as LeaderboardType;
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);

    let users;

    switch (type) {
      case 'xp':
        users = await prisma.user.findMany({
          select: {
            id: true,
            username: true,
            avatar: true,
            xp: true,
            level: true,
          },
          orderBy: { xp: 'desc' },
          take: limit,
        });
        break;

      case 'level':
        users = await prisma.user.findMany({
          select: {
            id: true,
            username: true,
            avatar: true,
            xp: true,
            level: true,
          },
          orderBy: [{ level: 'desc' }, { xp: 'desc' }],
          take: limit,
        });
        break;

      case 'games':
        users = await prisma.user.findMany({
          select: {
            id: true,
            username: true,
            avatar: true,
            xp: true,
            level: true,
            _count: {
              select: { playHistory: true },
            },
          },
          orderBy: {
            playHistory: { _count: 'desc' },
          },
          take: limit,
        });
        break;

      case 'achievements':
        users = await prisma.user.findMany({
          select: {
            id: true,
            username: true,
            avatar: true,
            xp: true,
            level: true,
            _count: {
              select: { userAchievements: true },
            },
          },
          orderBy: {
            userAchievements: { _count: 'desc' },
          },
          take: limit,
        });
        break;

      default:
        return NextResponse.json({ error: 'Invalid leaderboard type' }, { status: 400 });
    }

    // Add rank to each user
    const rankedUsers = users.map((user, index) => {
      const countData = '_count' in user ? user._count as Record<string, number> : null;
      return {
        rank: index + 1,
        ...user,
        gamesPlayed: countData && 'playHistory' in countData ? countData.playHistory : undefined,
        achievementsCount: countData && 'userAchievements' in countData ? countData.userAchievements : undefined,
      };
    });

    return NextResponse.json({
      type,
      users: rankedUsers,
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
