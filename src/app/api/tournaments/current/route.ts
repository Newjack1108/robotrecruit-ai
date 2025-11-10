import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/tournaments/current
 * Get the currently active tournament
 */
export async function GET() {
  try {
    const now = new Date();

    // Find active tournament
    const tournament = await prisma.tournament.findFirst({
      where: {
        status: 'active',
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: {
        entries: {
          include: {
            user: {
              select: {
                email: true,
                clerkId: true,
              },
            },
          },
          orderBy: {
            score: 'desc',
          },
          take: 100,
        },
      },
    });

    if (!tournament) {
      return NextResponse.json({ tournament: null });
    }

    // Calculate ranks
    const entriesWithRank = tournament.entries.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

    return NextResponse.json({
      tournament: {
        ...tournament,
        entries: entriesWithRank,
      },
    });
  } catch (error) {
    console.error('[TOURNAMENT_CURRENT_GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch current tournament' },
      { status: 500 }
    );
  }
}

