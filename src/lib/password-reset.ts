import { prisma } from './prisma';
import { randomBytes, createHash } from 'crypto';

const TOKEN_EXPIRY_HOURS = 1;

export function generateResetToken(): string {
  return randomBytes(32).toString('hex');
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export async function createPasswordResetToken(email: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    // Return null but don't reveal if user exists
    return null;
  }

  // Invalidate any existing tokens
  await prisma.passwordReset.updateMany({
    where: { userId: user.id, used: false },
    data: { used: true },
  });

  const token = generateResetToken();
  const hashedToken = hashToken(token);
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

  await prisma.passwordReset.create({
    data: {
      userId: user.id,
      token: hashedToken,
      expiresAt,
    },
  });

  return token;
}

export async function validateResetToken(token: string): Promise<string | null> {
  const hashedToken = hashToken(token);

  const reset = await prisma.passwordReset.findUnique({
    where: { token: hashedToken },
    include: { user: true },
  });

  if (!reset) {
    return null;
  }

  if (reset.used) {
    return null;
  }

  if (reset.expiresAt < new Date()) {
    return null;
  }

  return reset.userId;
}

export async function markTokenAsUsed(token: string): Promise<void> {
  const hashedToken = hashToken(token);

  await prisma.passwordReset.update({
    where: { token: hashedToken },
    data: { used: true },
  });
}

export async function cleanupExpiredTokens(): Promise<void> {
  await prisma.passwordReset.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } },
        { used: true, createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      ],
    },
  });
}
