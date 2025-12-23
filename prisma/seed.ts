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
