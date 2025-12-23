import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { validateSession } from '@/lib/auth';
import { generateToken, sendVerificationEmail } from '@/lib/email';

// POST - Resend verification email
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

    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email is already verified' },
        { status: 400 }
      );
    }

    // Check if there's an existing non-expired token
    const existingVerification = await prisma.emailVerification.findFirst({
      where: {
        userId: user.id,
        expiresAt: { gt: new Date() },
      },
    });

    // Rate limit: only allow resending every 60 seconds
    if (existingVerification) {
      const timeSinceCreated = Date.now() - existingVerification.createdAt.getTime();
      if (timeSinceCreated < 60 * 1000) {
        const waitTime = Math.ceil((60 * 1000 - timeSinceCreated) / 1000);
        return NextResponse.json(
          { error: `Please wait ${waitTime} seconds before requesting another email` },
          { status: 429 }
        );
      }

      // Delete old token
      await prisma.emailVerification.delete({
        where: { id: existingVerification.id },
      });
    }

    // Generate new token
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.emailVerification.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // Send verification email
    await sendVerificationEmail(user.email, token);

    return NextResponse.json({
      success: true,
      message: 'Verification email sent',
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { error: 'Failed to resend verification email' },
      { status: 500 }
    );
  }
}
