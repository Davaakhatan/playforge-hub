import { prisma } from './prisma';

interface AchievementCriteria {
  type: 'games_played' | 'games_favorited' | 'comments_posted' | 'play_time' | 'level';
  value: number;
}

// Check and award achievements for a user
export async function checkAchievements(userId: string): Promise<string[]> {
  const awarded: string[] = [];

  // Get user stats
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      _count: {
        select: {
          favorites: true,
          playHistory: true,
          comments: true,
        },
      },
      userAchievements: {
        select: { achievementId: true },
      },
    },
  });

  if (!user) return awarded;

  const existingAchievements = new Set(
    user.userAchievements.map((ua) => ua.achievementId)
  );

  // Get all achievements
  const achievements = await prisma.achievement.findMany();

  for (const achievement of achievements) {
    // Skip if already earned
    if (existingAchievements.has(achievement.id)) continue;

    const criteria = JSON.parse(achievement.criteria) as AchievementCriteria;
    let earned = false;

    switch (criteria.type) {
      case 'games_played':
        earned = user._count.playHistory >= criteria.value;
        break;
      case 'games_favorited':
        earned = user._count.favorites >= criteria.value;
        break;
      case 'comments_posted':
        earned = user._count.comments >= criteria.value;
        break;
      case 'play_time':
        earned = user.totalPlayTime >= criteria.value;
        break;
      case 'level':
        earned = user.level >= criteria.value;
        break;
    }

    if (earned) {
      // Award the achievement
      await prisma.userAchievement.create({
        data: {
          userId,
          achievementId: achievement.id,
        },
      });

      // Award XP
      if (achievement.xpReward > 0) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            xp: { increment: achievement.xpReward },
          },
        });
      }

      // Create notification
      await prisma.notification.create({
        data: {
          userId,
          type: 'achievement',
          title: 'Achievement Unlocked!',
          message: `You earned the "${achievement.name}" achievement!`,
          link: '/profile#achievements',
        },
      });

      awarded.push(achievement.id);
    }
  }

  // Check for level up
  await checkLevelUp(userId);

  return awarded;
}

// XP required for each level (exponential curve)
function getXPForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

// Check and process level up
export async function checkLevelUp(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { xp: true, level: true },
  });

  if (!user) return false;

  const xpForNextLevel = getXPForLevel(user.level + 1);

  if (user.xp >= xpForNextLevel) {
    const newLevel = user.level + 1;

    await prisma.user.update({
      where: { id: userId },
      data: { level: newLevel },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId,
        type: 'system',
        title: 'Level Up!',
        message: `Congratulations! You've reached level ${newLevel}!`,
        link: '/profile',
      },
    });

    return true;
  }

  return false;
}

// Add XP to user
export async function addXP(userId: string, amount: number): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      xp: { increment: amount },
    },
  });

  await checkLevelUp(userId);
}

// Get user's achievements with progress
export async function getUserAchievements(userId: string) {
  const [achievements, userAchievements, user] = await Promise.all([
    prisma.achievement.findMany({
      orderBy: [{ rarity: 'asc' }, { name: 'asc' }],
    }),
    prisma.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true, unlockedAt: true },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            favorites: true,
            playHistory: true,
            comments: true,
          },
        },
      },
    }),
  ]);

  const earnedMap = new Map(
    userAchievements.map((ua) => [ua.achievementId, ua.unlockedAt])
  );

  return achievements.map((achievement) => {
    const criteria = JSON.parse(achievement.criteria) as AchievementCriteria;
    let progress = 0;

    if (user) {
      switch (criteria.type) {
        case 'games_played':
          progress = Math.min(user._count.playHistory / criteria.value, 1);
          break;
        case 'games_favorited':
          progress = Math.min(user._count.favorites / criteria.value, 1);
          break;
        case 'comments_posted':
          progress = Math.min(user._count.comments / criteria.value, 1);
          break;
        case 'play_time':
          progress = Math.min(user.totalPlayTime / criteria.value, 1);
          break;
        case 'level':
          progress = Math.min(user.level / criteria.value, 1);
          break;
      }
    }

    return {
      ...achievement,
      earned: earnedMap.has(achievement.id),
      unlockedAt: earnedMap.get(achievement.id) || null,
      progress: Math.round(progress * 100),
    };
  });
}
