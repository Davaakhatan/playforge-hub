import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/users/[username] - Get user profile
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        avatar: true,
        bio: true,
        createdAt: true,
        _count: {
          select: {
            reviews: true,
            favorites: true,
            collections: { where: { isPublic: true } },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get recent reviews
    const recentReviews = await prisma.review.findMany({
      where: { userId: user.id },
      take: 5,
      orderBy: { createdAt: 'desc' },
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

    // Get public collections
    const collections = await prisma.collection.findMany({
      where: { userId: user.id, isPublic: true },
      take: 5,
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: { select: { games: true } },
      },
    });

    return NextResponse.json({
      ...user,
      stats: {
        reviews: user._count.reviews,
        favorites: user._count.favorites,
        collections: user._count.collections,
      },
      recentReviews,
      collections,
    });
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}
