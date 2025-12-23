import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getHealthStatus } from '@/lib/monitoring';

export async function GET() {
  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`;

    const health = await getHealthStatus();

    return NextResponse.json(
      {
        ...health,
        database: 'connected',
        timestamp: new Date().toISOString(),
      },
      {
        status: health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        database: 'disconnected',
        error: 'Health check failed',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
