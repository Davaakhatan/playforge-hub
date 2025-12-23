import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { validateSession } from '@/lib/auth';

// GET - Get comments for a game
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Find the game (support both id and slug)
    const game = await prisma.game.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    // Get top-level comments (no parent)
    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: {
          gameId: game.id,
          parentId: null,
          isHidden: false,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
          likes: {
            select: { userId: true },
          },
          replies: {
            where: { isHidden: false },
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  avatar: true,
                },
              },
              likes: {
                select: { userId: true },
              },
            },
            orderBy: { createdAt: 'asc' },
            take: 3, // Only load first 3 replies
          },
          _count: {
            select: { replies: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.comment.count({
        where: {
          gameId: game.id,
          parentId: null,
          isHidden: false,
        },
      }),
    ]);

    // Transform comments to include like count
    const transformedComments = comments.map((comment) => ({
      ...comment,
      likeCount: comment.likes.length,
      replyCount: comment._count.replies,
      replies: comment.replies.map((reply) => ({
        ...reply,
        likeCount: reply.likes.length,
      })),
    }));

    return NextResponse.json({
      comments: transformedComments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get comments error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

// POST - Create a new comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await request.json();
    const { content, parentId } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }

    if (content.length > 2000) {
      return NextResponse.json(
        { error: 'Comment must be less than 2000 characters' },
        { status: 400 }
      );
    }

    // Find the game (support both id and slug)
    const game = await prisma.game.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    // If it's a reply, verify the parent comment exists
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
      });

      if (!parentComment || parentComment.gameId !== game.id) {
        return NextResponse.json(
          { error: 'Parent comment not found' },
          { status: 404 }
        );
      }
    }

    // Create the comment
    const comment = await prisma.comment.create({
      data: {
        userId: user.id,
        gameId: game.id,
        content: content.trim(),
        parentId: parentId || null,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    // If it's a reply, notify the parent comment's author
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
        select: { userId: true },
      });

      if (parentComment && parentComment.userId !== user.id) {
        await prisma.notification.create({
          data: {
            userId: parentComment.userId,
            type: 'comment_reply',
            title: 'New reply to your comment',
            message: `${user.username} replied to your comment on ${game.title}`,
            link: `/games/${game.slug}#comment-${comment.id}`,
          },
        });
      }
    }

    return NextResponse.json({
      comment: {
        ...comment,
        likeCount: 0,
        replyCount: 0,
      },
    });
  } catch (error) {
    console.error('Create comment error:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}
