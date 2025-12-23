import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { validateSession } from '@/lib/auth';
import { generateSecret, generateTOTPUri, generateBackupCodes } from '@/lib/totp';
import bcrypt from 'bcryptjs';

// POST - Generate 2FA secret and return QR code URI
export async function POST(request: Request) {
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

    if (user.twoFactorEnabled) {
      return NextResponse.json(
        { error: '2FA is already enabled' },
        { status: 400 }
      );
    }

    // Get password from request to verify identity
    const body = await request.json();
    const { password } = body;

    // Users who signed up via OAuth may not have a password
    if (user.passwordHash) {
      if (!password) {
        return NextResponse.json(
          { error: 'Password is required to enable 2FA' },
          { status: 400 }
        );
      }

      const validPassword = await bcrypt.compare(password, user.passwordHash);
      if (!validPassword) {
        return NextResponse.json(
          { error: 'Invalid password' },
          { status: 401 }
        );
      }
    }

    // Generate secret
    const secret = generateSecret();
    const uri = generateTOTPUri(secret, user.email);

    // Store secret temporarily (not enabled yet)
    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorSecret: secret },
    });

    // Generate backup codes
    const backupCodes = generateBackupCodes();

    // Hash and store backup codes
    const hashedCodes = await Promise.all(
      backupCodes.map(async (code) => ({
        userId: user.id,
        code: await bcrypt.hash(code, 10),
      }))
    );

    // Delete any existing backup codes
    await prisma.twoFactorBackup.deleteMany({
      where: { userId: user.id },
    });

    // Create new backup codes
    await prisma.twoFactorBackup.createMany({
      data: hashedCodes,
    });

    return NextResponse.json({
      secret,
      uri,
      backupCodes, // Return plain text codes once for user to save
    });
  } catch (error) {
    console.error('2FA enable error:', error);
    return NextResponse.json(
      { error: 'Failed to enable 2FA' },
      { status: 500 }
    );
  }
}
