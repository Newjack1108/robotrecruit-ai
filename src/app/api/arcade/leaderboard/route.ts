import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/arcade/leaderboard?gameType=bot_memory_match&period=daily&limit=10
 * Get leaderboard scores
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gameType = searchParams.get('gameType') || 'bot_memory_match';
    const period = searchParams.get('period') || 'daily'; // daily, weekly, alltime
    const limit = parseInt(searchParams.get('limit') || '10');

    let dateFilter = {};
    const now = new Date();

    if (period === 'daily') {
      // Today's scores (UTC)
      const startOfDay = new Date(now);
      startOfDay.setUTCHours(0, 0, 0, 0);
      dateFilter = {
        createdAt: {
          gte: startOfDay
        }
      };
    } else if (period === 'weekly') {
      // Last 7 days
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      dateFilter = {
        createdAt: {
          gte: weekAgo
        }
      };
    }
    // For 'alltime', no date filter

    // Get ALL scores for the period/gameType, then group by user to get their best
    const allScores = await (prisma as any).gameScore.findMany({
      where: {
        gameType,
        ...dateFilter
      },
      include: {
        user: {
          select: {
            id: true,
            clerkId: true,
            email: true,
            tier: true
          }
        }
      },
      orderBy: [
        { score: 'desc' },
        { timeSeconds: 'asc' },
        { createdAt: 'asc' }
      ]
    });

    // Group by user and take only their best score
    const userBestScores = new Map();
    allScores.forEach((score: any) => {
      const userId = score.user.id;
      if (!userBestScores.has(userId)) {
        userBestScores.set(userId, score);
      }
    });

    // Convert back to array and take top N
    const scores = Array.from(userBestScores.values()).slice(0, limit);

    // Format for frontend (hide sensitive data)
    const leaderboard = scores.map((entry: any, index: number) => ({
      rank: index + 1,
      userId: entry.user.clerkId,
      userName: entry.user.email.split('@')[0], // Use email prefix as display name
      tier: entry.user.tier,
      score: entry.score,
      moves: entry.moves,
      timeSeconds: entry.timeSeconds,
      createdAt: entry.createdAt
    }));

    return NextResponse.json({ leaderboard, period });
  } catch (error) {
    console.error('[ARCADE_LEADERBOARD_GET]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

