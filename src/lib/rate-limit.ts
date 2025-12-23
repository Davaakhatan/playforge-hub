import { prisma } from './prisma';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

const defaultConfig: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60, // 60 requests per minute
};

const endpointConfigs: Record<string, RateLimitConfig> = {
  '/api/auth/login': { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 5 per 15 min
  '/api/auth/register': { windowMs: 60 * 60 * 1000, maxRequests: 3 }, // 3 per hour
  '/api/auth/forgot-password': { windowMs: 60 * 60 * 1000, maxRequests: 3 }, // 3 per hour
  '/api/auth/reset-password': { windowMs: 60 * 60 * 1000, maxRequests: 5 }, // 5 per hour
  '/api/reviews': { windowMs: 60 * 1000, maxRequests: 10 }, // 10 per minute
};

export async function checkRateLimit(
  identifier: string,
  endpoint: string
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  const config = endpointConfigs[endpoint] || defaultConfig;
  const now = new Date();
  const windowStart = new Date(now.getTime() - config.windowMs);

  // Clean up old entries
  await prisma.rateLimit.deleteMany({
    where: {
      windowStart: { lt: windowStart },
    },
  });

  // Get or create rate limit entry
  const existing = await prisma.rateLimit.findUnique({
    where: {
      identifier_endpoint: { identifier, endpoint },
    },
  });

  if (!existing || existing.windowStart < windowStart) {
    // Create new window
    await prisma.rateLimit.upsert({
      where: {
        identifier_endpoint: { identifier, endpoint },
      },
      create: {
        identifier,
        endpoint,
        count: 1,
        windowStart: now,
      },
      update: {
        count: 1,
        windowStart: now,
      },
    });

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt: new Date(now.getTime() + config.windowMs),
    };
  }

  if (existing.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(existing.windowStart.getTime() + config.windowMs),
    };
  }

  // Increment count
  await prisma.rateLimit.update({
    where: {
      identifier_endpoint: { identifier, endpoint },
    },
    data: {
      count: { increment: 1 },
    },
  });

  return {
    allowed: true,
    remaining: config.maxRequests - existing.count - 1,
    resetAt: new Date(existing.windowStart.getTime() + config.windowMs),
  };
}

export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  return '127.0.0.1';
}
