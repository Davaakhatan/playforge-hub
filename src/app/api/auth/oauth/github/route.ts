import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthorizationUrl, generateState, isProviderConfigured } from '@/lib/oauth';

export async function GET() {
  if (!isProviderConfigured('github')) {
    return NextResponse.json(
      { error: 'GitHub OAuth is not configured' },
      { status: 503 }
    );
  }

  const state = generateState();

  // Store state in cookie for verification
  const cookieStore = await cookies();
  cookieStore.set('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 minutes
    path: '/',
  });

  const authUrl = getAuthorizationUrl('github', state);
  return NextResponse.redirect(authUrl);
}
