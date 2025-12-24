import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ProfileContent } from './ProfileContent';

export const metadata = {
  title: 'Profile',
  description: 'View and manage your Playforge profile',
};

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch user stats
  const [favoriteCount, playHistoryCount, reviewCount, collectionCount] = await Promise.all([
    prisma.favorite.count({ where: { userId: user.id } }),
    prisma.playHistory.count({ where: { userId: user.id } }),
    prisma.review.count({ where: { userId: user.id } }),
    prisma.collection.count({ where: { userId: user.id } }),
  ]);

  // Fetch recent activity and high scores
  const [recentPlays, recentFavorites, highScores] = await Promise.all([
    prisma.playHistory.findMany({
      where: { userId: user.id },
      include: { game: { select: { slug: true, title: true, thumbnail: true } } },
      orderBy: { lastPlayed: 'desc' },
      take: 5,
    }),
    prisma.favorite.findMany({
      where: { userId: user.id },
      include: { game: { select: { slug: true, title: true, thumbnail: true } } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.gameScore.findMany({
      where: { userId: user.id },
      include: { game: { select: { slug: true, title: true, thumbnail: true } } },
      orderBy: { score: 'desc' },
      take: 5,
      distinct: ['gameId'],
    }),
  ]);

  const stats = {
    favoriteCount,
    playHistoryCount,
    reviewCount,
    collectionCount,
  };

  return (
    <ProfileContent
      user={user}
      stats={stats}
      recentPlays={recentPlays}
      recentFavorites={recentFavorites}
      highScores={highScores}
    />
  );
}
