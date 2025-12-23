import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { validateSession, createSession } from '@/lib/auth';
import { verifyTOTP } from '@/lib/totp';
import bcrypt from 'bcryptjs';

// POST - Verify TOTP and enable 2FA
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;
    const pendingLoginUserId = cookieStore.get('pending_2fa_user')?.value;

    const body = await request.json();
    const { code, action } = body;

    if (!code || code.length !== 6) {
      return NextResponse.json(
        { error: 'Invalid code format' },
        { status: 400 }
      );
    }

    // Handle login verification
    if (action === 'login' && pendingLoginUserId) {
      const user = await prisma.user.findUnique({
        where: { id: pendingLoginUserId },
      });

      if (!user || !user.twoFactorSecret || !user.twoFactorEnabled) {
        return NextResponse.json(
          { error: 'Invalid 2FA state' },
          { status: 400 }
        );
      }

      // Check TOTP
      const isValid = verifyTOTP(user.twoFactorSecret, code);

      // If TOTP fails, check backup codes
      if (!isValid) {
        const backupCodes = await prisma.twoFactorBackup.findMany({
          where: { userId: user.id, used: false },
        });

        let backupCodeValid = false;
        let usedBackupId: string | null = null;

        for (const backup of backupCodes) {
          const matches = await bcrypt.compare(code.toUpperCase().replace('-', ''), backup.code);
          if (matches) {
            backupCodeValid = true;
            usedBackupId = backup.id;
            break;
          }
        }

        if (!backupCodeValid) {
          return NextResponse.json(
            { error: 'Invalid verification code' },
            { status: 401 }
          );
        }

        // Mark backup code as used
        if (usedBackupId) {
          await prisma.twoFactorBackup.update({
            where: { id: usedBackupId },
            data: { used: true },
          });
        }
      }

      // Create session
      const newSessionToken = await createSession(user.id);

      // Clear pending 2FA cookie and set session
      const response = NextResponse.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
      });

      response.cookies.delete('pending_2fa_user');
      response.cookies.set('session', newSessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });

      return response;
    }

    // Handle setup verification (enable 2FA)
    if (!sessionToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await validateSession(sessionToken);
    if (!user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    if (!user.twoFactorSecret) {
      return NextResponse.json(
        { error: 'Please start 2FA setup first' },
        { status: 400 }
      );
    }

    if (user.twoFactorEnabled) {
      return NextResponse.json(
        { error: '2FA is already enabled' },
        { status: 400 }
      );
    }

    // Verify the TOTP code
    const isValid = verifyTOTP(user.twoFactorSecret, code);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 401 }
      );
    }

    // Enable 2FA
    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorEnabled: true },
    });

    return NextResponse.json({
      success: true,
      message: '2FA has been enabled successfully',
    });
  } catch (error) {
    console.error('2FA verify error:', error);
    return NextResponse.json(
      { error: 'Failed to verify 2FA' },
      { status: 500 }
    );
  }
}
