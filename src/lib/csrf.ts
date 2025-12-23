import { cookies } from 'next/headers';
import { randomBytes, createHash } from 'crypto';

const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const TOKEN_LENGTH = 32;

export function generateCSRFToken(): string {
  return randomBytes(TOKEN_LENGTH).toString('hex');
}

export function hashCSRFToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export async function getCSRFToken(): Promise<string> {
  const cookieStore = await cookies();
  const existingToken = cookieStore.get(CSRF_COOKIE_NAME);
  
  if (existingToken) {
    return existingToken.value;
  }
  
  const newToken = generateCSRFToken();
  return newToken;
}

export async function setCSRFCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  });
}

export async function validateCSRFToken(request: Request): Promise<boolean> {
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(CSRF_COOKIE_NAME)?.value;
  const headerToken = request.headers.get(CSRF_HEADER_NAME);
  
  if (!cookieToken || !headerToken) {
    return false;
  }
  
  // Use timing-safe comparison
  const cookieHash = hashCSRFToken(cookieToken);
  const headerHash = hashCSRFToken(headerToken);
  
  if (cookieHash.length !== headerHash.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < cookieHash.length; i++) {
    result |= cookieHash.charCodeAt(i) ^ headerHash.charCodeAt(i);
  }
  
  return result === 0;
}

// List of endpoints that require CSRF protection
const protectedMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
const exemptPaths = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
];

export function requiresCSRFProtection(request: Request): boolean {
  if (!protectedMethods.includes(request.method)) {
    return false;
  }
  
  const url = new URL(request.url);
  if (exemptPaths.includes(url.pathname)) {
    return false;
  }
  
  return true;
}
