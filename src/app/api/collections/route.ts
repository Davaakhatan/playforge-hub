import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET /api/collections - Get user's collections
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('gameId');

    const collections = await prisma.collection.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: { select: { games: true } },
        games: {
          take: 4,
          orderBy: { addedAt: 'desc' },
          include: {
            game: {
              select: {
                id: true,
                slug: true,
                title: true,
                thumbnail: true,
              },
            },
          },
        },
      },
    });

    // If gameId is provided, add hasGame flag to each collection
    if (gameId) {
      const collectionsWithGame = await prisma.collectionGame.findMany({
        where: {
          gameId,
          collection: { userId: user.id },
        },
        select: { collectionId: true },
      });
      const collectionIdsWithGame = new Set(collectionsWithGame.map(c => c.collectionId));

      const result = collections.map(collection => ({
        ...collection,
        hasGame: collectionIdsWithGame.has(collection.id),
      }));
      return NextResponse.json(result);
    }

    return NextResponse.json(collections);
  } catch (error) {
    console.error('Failed to fetch collections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collections' },
      { status: 500 }
    );
  }
}

// POST /api/collections - Create a new collection
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, isPublic } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const collection = await prisma.collection.create({
      data: {
        userId: user.id,
        name: name.trim(),
        description: description?.trim() || null,
        isPublic: isPublic || false,
      },
    });

    return NextResponse.json(collection, { status: 201 });
  } catch (error) {
    console.error('Failed to create collection:', error);
    return NextResponse.json(
      { error: 'Failed to create collection' },
      { status: 500 }
    );
  }
}
