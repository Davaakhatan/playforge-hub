import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { createSession } from '@/lib/auth';
import { exchangeCodeForToken, getUserInfo } from '@/lib/oauth';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // Handle OAuth errors
  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error)}`, request.url)
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL('/login?error=missing_params', request.url)
    );
  }

  // Verify state
  const cookieStore = await cookies();
  const storedState = cookieStore.get('oauth_state')?.value;

  if (!storedState || storedState !== state) {
    return NextResponse.redirect(
      new URL('/login?error=invalid_state', request.url)
    );
  }

  // Clear the state cookie
  cookieStore.delete('oauth_state');

  try {
    // Exchange code for token
    const tokenData = await exchangeCodeForToken('google', code);

    // Get user info
    const userInfo = await getUserInfo('google', tokenData.access_token);

    if (!userInfo.email) {
      return NextResponse.redirect(
        new URL('/login?error=no_email', request.url)
      );
    }

    // Find or create user
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: userInfo.email },
          {
            oauthAccounts: {
              some: {
                provider: 'google',
                providerId: userInfo.id,
              },
            },
          },
        ],
      },
      include: { oauthAccounts: true },
    });

    if (!user) {
      // Create new user
      const username = userInfo.email.split('@')[0] + '_' + Math.random().toString(36).slice(2, 6);
      user = await prisma.user.create({
        data: {
          email: userInfo.email,
          username,
          avatar: userInfo.avatar,
          emailVerified: true, // OAuth emails are verified
          oauthAccounts: {
            create: {
              provider: 'google',
              providerId: userInfo.id,
              accessToken: tokenData.access_token,
              refreshToken: tokenData.refresh_token,
              expiresAt: tokenData.expires_in
                ? new Date(Date.now() + tokenData.expires_in * 1000)
                : undefined,
            },
          },
        },
        include: { oauthAccounts: true },
      });
    } else {
      // Check if OAuth account exists
      const existingOAuth = user.oauthAccounts.find(
        (acc) => acc.provider === 'google' && acc.providerId === userInfo.id
      );

      if (!existingOAuth) {
        // Link OAuth account to existing user
        await prisma.oAuthAccount.create({
          data: {
            userId: user.id,
            provider: 'google',
            providerId: userInfo.id,
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            expiresAt: tokenData.expires_in
              ? new Date(Date.now() + tokenData.expires_in * 1000)
              : undefined,
          },
        });
      } else {
        // Update existing OAuth account
        await prisma.oAuthAccount.update({
          where: { id: existingOAuth.id },
          data: {
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            expiresAt: tokenData.expires_in
              ? new Date(Date.now() + tokenData.expires_in * 1000)
              : undefined,
          },
        });
      }
    }

    // Create session
    const sessionToken = await createSession(user.id);

    // Set session cookie (must match SESSION_COOKIE in auth.ts)
    const response = NextResponse.redirect(new URL('/', request.url));
    response.cookies.set('playforge_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('Google OAuth error:', err);
    return NextResponse.redirect(
      new URL('/login?error=oauth_failed', request.url)
    );
  }
}
