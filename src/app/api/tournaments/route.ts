import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/tournaments
 * Get list of tournaments (active, upcoming, ended)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'active';

    const tournaments = await prisma.tournament.findMany({
      where: {
        status,
      },
      include: {
        _count: {
          select: {
            entries: true,
          },
        },
      },
      orderBy: {
        startDate: 'desc',
      },
      take: 20,
    });

    return NextResponse.json({ tournaments });
  } catch (error) {
    console.error('[TOURNAMENTS_GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch tournaments' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tournaments
 * Create a new tournament (admin only for now, can be automated with cron)
 */
export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, type, startDate, endDate, prizes } = body;

    if (!name || !type || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const tournament = await prisma.tournament.create({
      data: {
        name,
        description: description || '',
        type,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: 'upcoming',
        prizes: prizes || {
          '1st': { credits: 100, points: 500 },
          '2nd': { credits: 50, points: 250 },
          '3rd': { credits: 25, points: 100 },
        },
      },
    });

    return NextResponse.json({
      success: true,
      tournament,
    });
  } catch (error) {
    console.error('[TOURNAMENTS_POST]', error);
    return NextResponse.json(
      { error: 'Failed to create tournament' },
      { status: 500 }
    );
  }
}

