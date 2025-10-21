import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      service: 'robotrecruit-ai',
    });
  } catch (error) {
    console.error('[HEALTH_CHECK_ERROR]', error);
    
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        service: 'robotrecruit-ai',
        error: 'Database connection failed',
      },
      { status: 503 }
    );
  }
}

