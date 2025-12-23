import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// POST /api/collections/[id]/games - Add game to collection
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const collection = await prisma.collection.findUnique({ where: { id } });
    if (!collection || collection.userId !== user.id) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    const body = await request.json();
    const { gameId } = body;

    if (!gameId) {
      return NextResponse.json({ error: 'gameId is required' }, { status: 400 });
    }

    // Check if game exists
    const game = await prisma.game.findUnique({ where: { id: gameId } });
    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    // Check if already in collection
    const existing = await prisma.collectionGame.findUnique({
      where: {
        collectionId_gameId: { collectionId: id, gameId },
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'Game already in collection' }, { status: 400 });
    }

    const collectionGame = await prisma.collectionGame.create({
      data: { collectionId: id, gameId },
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
    });

    return NextResponse.json(collectionGame, { status: 201 });
  } catch (error) {
    console.error('Failed to add game to collection:', error);
    return NextResponse.json(
      { error: 'Failed to add game to collection' },
      { status: 500 }
    );
  }
}

// DELETE /api/collections/[id]/games - Remove game from collection
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const collection = await prisma.collection.findUnique({ where: { id } });
    if (!collection || collection.userId !== user.id) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('gameId');

    if (!gameId) {
      return NextResponse.json({ error: 'gameId is required' }, { status: 400 });
    }

    await prisma.collectionGame.delete({
      where: {
        collectionId_gameId: { collectionId: id, gameId },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to remove game from collection:', error);
    return NextResponse.json(
      { error: 'Failed to remove game from collection' },
      { status: 500 }
    );
  }
}
