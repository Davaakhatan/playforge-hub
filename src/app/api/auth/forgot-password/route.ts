import { NextRequest, NextResponse } from 'next/server';
import { createPasswordResetToken } from '@/lib/password-reset';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    const { allowed, remaining, resetAt } = await checkRateLimit(
      clientIP,
      '/api/auth/forgot-password'
    );

    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': resetAt.toISOString(),
          },
        }
      );
    }

    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Always return success to prevent email enumeration
    const token = await createPasswordResetToken(email);

    if (token) {
      // In production, send email here
      // For development, log the reset link
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const resetUrl = `${baseUrl}/reset-password?token=${token}`;
      console.log(`Password reset link for ${email}: ${resetUrl}`);

      // TODO: Integrate with email service (SendGrid, Resend, etc.)
      // await sendPasswordResetEmail(email, resetUrl);
    }

    return NextResponse.json(
      { message: 'If an account with that email exists, we sent a password reset link.' },
      {
        headers: {
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': resetAt.toISOString(),
        },
      }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
