import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const games = await prisma.game.findMany({
      where: { hidden: false },
      select: { tags: true },
    });

    const tagSet = new Set<string>();
    games.forEach((game) => {
      const tags = JSON.parse(game.tags) as string[];
      tags.forEach((tag) => tagSet.add(tag));
    });

    return NextResponse.json(Array.from(tagSet).sort());
  } catch (error) {
    console.error('Get tags error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
