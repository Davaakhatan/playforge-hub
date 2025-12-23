import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import catalogData from '../catalog/games.json';

const prisma = new PrismaClient();

interface GameData {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  thumbnail: string;
  screenshots?: string[];
  tags?: string[];
  size: string;
  type: string;
  releaseStatus: string;
  url: string;
  platforms?: string[];
  developer?: string;
  releaseDate?: string;
  version?: string;
  featured?: boolean;
  hidden?: boolean;
}

async function main() {
  console.log('Starting seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@playforge.local' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@playforge.local',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log('Created admin user:', admin.username);

  // Migrate games from JSON catalog
  for (const game of catalogData as GameData[]) {
    const existingGame = await prisma.game.findUnique({
      where: { slug: game.slug },
    });

    if (!existingGame) {
      await prisma.game.create({
        data: {
          slug: game.slug,
          title: game.title,
          shortDescription: game.shortDescription,
          longDescription: game.longDescription,
          thumbnail: game.thumbnail,
          screenshots: JSON.stringify(game.screenshots || []),
          tags: JSON.stringify(game.tags || []),
          size: game.size,
          type: game.type,
          releaseStatus: game.releaseStatus,
          url: game.url,
          platforms: JSON.stringify(game.platforms || []),
          developer: game.developer,
          releaseDate: game.releaseDate ? new Date(game.releaseDate) : null,
          version: game.version,
          featured: game.featured || false,
          hidden: game.hidden || false,
        },
      });
      console.log('Created game:', game.title);
    } else {
      console.log('Game already exists:', game.title);
    }
  }

  // Create default achievements
  const achievements = [
    // Games played achievements
    {
      slug: 'first-game',
      name: 'First Steps',
      description: 'Play your first game',
      icon: '🎮',
      xpReward: 10,
      rarity: 'common',
      criteria: JSON.stringify({ type: 'games_played', value: 1 }),
    },
    {
      slug: 'gamer-10',
      name: 'Getting Started',
      description: 'Play 10 different games',
      icon: '🕹️',
      xpReward: 25,
      rarity: 'common',
      criteria: JSON.stringify({ type: 'games_played', value: 10 }),
    },
    {
      slug: 'gamer-50',
      name: 'Game Enthusiast',
      description: 'Play 50 different games',
      icon: '🎯',
      xpReward: 100,
      rarity: 'rare',
      criteria: JSON.stringify({ type: 'games_played', value: 50 }),
    },
    {
      slug: 'gamer-100',
      name: 'Game Master',
      description: 'Play 100 different games',
      icon: '👑',
      xpReward: 250,
      rarity: 'epic',
      criteria: JSON.stringify({ type: 'games_played', value: 100 }),
    },
    // Favorites achievements
    {
      slug: 'first-favorite',
      name: 'First Love',
      description: 'Add your first game to favorites',
      icon: '❤️',
      xpReward: 10,
      rarity: 'common',
      criteria: JSON.stringify({ type: 'games_favorited', value: 1 }),
    },
    {
      slug: 'collector-25',
      name: 'Collector',
      description: 'Add 25 games to your favorites',
      icon: '⭐',
      xpReward: 50,
      rarity: 'rare',
      criteria: JSON.stringify({ type: 'games_favorited', value: 25 }),
    },
    {
      slug: 'collector-100',
      name: 'Grand Collector',
      description: 'Add 100 games to your favorites',
      icon: '🌟',
      xpReward: 200,
      rarity: 'epic',
      criteria: JSON.stringify({ type: 'games_favorited', value: 100 }),
    },
    // Comments achievements
    {
      slug: 'first-comment',
      name: 'Voice Heard',
      description: 'Post your first comment',
      icon: '💬',
      xpReward: 10,
      rarity: 'common',
      criteria: JSON.stringify({ type: 'comments_posted', value: 1 }),
    },
    {
      slug: 'commentator-10',
      name: 'Commentator',
      description: 'Post 10 comments',
      icon: '📝',
      xpReward: 25,
      rarity: 'common',
      criteria: JSON.stringify({ type: 'comments_posted', value: 10 }),
    },
    {
      slug: 'commentator-50',
      name: 'Community Voice',
      description: 'Post 50 comments',
      icon: '📣',
      xpReward: 100,
      rarity: 'rare',
      criteria: JSON.stringify({ type: 'comments_posted', value: 50 }),
    },
    // Level achievements
    {
      slug: 'level-5',
      name: 'Rising Star',
      description: 'Reach level 5',
      icon: '✨',
      xpReward: 50,
      rarity: 'common',
      criteria: JSON.stringify({ type: 'level', value: 5 }),
    },
    {
      slug: 'level-10',
      name: 'Veteran',
      description: 'Reach level 10',
      icon: '🏆',
      xpReward: 100,
      rarity: 'rare',
      criteria: JSON.stringify({ type: 'level', value: 10 }),
    },
    {
      slug: 'level-25',
      name: 'Elite Gamer',
      description: 'Reach level 25',
      icon: '💎',
      xpReward: 250,
      rarity: 'epic',
      criteria: JSON.stringify({ type: 'level', value: 25 }),
    },
    {
      slug: 'level-50',
      name: 'Legendary Player',
      description: 'Reach level 50',
      icon: '🔥',
      xpReward: 500,
      rarity: 'legendary',
      criteria: JSON.stringify({ type: 'level', value: 50 }),
    },
  ];

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { slug: achievement.slug },
      update: achievement,
      create: achievement,
    });
  }
  console.log('Created achievements:', achievements.length);

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
