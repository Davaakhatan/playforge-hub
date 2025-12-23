import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { validateSession } from '@/lib/auth';
import { getUserAchievements, checkAchievements } from '@/lib/achievements';

// GET - Get achievements (all or for current user)
export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;

    // If logged in, get user's achievements with progress
    if (sessionToken) {
      const user = await validateSession(sessionToken);
      if (user) {
        const achievements = await getUserAchievements(user.id);
        return NextResponse.json({ achievements });
      }
    }

    // Otherwise, just return all achievements without progress
    const achievements = await prisma.achievement.findMany({
      orderBy: [{ rarity: 'asc' }, { name: 'asc' }],
    });

    return NextResponse.json({
      achievements: achievements.map((a) => ({
        ...a,
        earned: false,
        unlockedAt: null,
        progress: 0,
      })),
    });
  } catch (error) {
    console.error('Get achievements error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    );
  }
}

// POST - Check for new achievements
export async function POST() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await validateSession(sessionToken);
    if (!user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const awarded = await checkAchievements(user.id);

    return NextResponse.json({
      success: true,
      awarded,
    });
  } catch (error) {
    console.error('Check achievements error:', error);
    return NextResponse.json(
      { error: 'Failed to check achievements' },
      { status: 500 }
    );
  }
}
