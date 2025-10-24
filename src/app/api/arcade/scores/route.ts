import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

/**
 * POST /api/arcade/scores
 * Submit a new game score
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { gameType, score, moves, timeSeconds, difficulty, metadata } = body;

    // Validate required fields
    if (!gameType || typeof score !== 'number' || typeof moves !== 'number' || typeof timeSeconds !== 'number') {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create game score
    const gameScore = await (prisma as any).gameScore.create({
      data: {
        userId: user.id,
        gameType,
        score,
        moves,
        timeSeconds,
        difficulty: difficulty || 'normal',
        metadata: metadata || {}
      }
    });

    // Update lifetime high score if this is a new record
    // @ts-expect-error - Prisma type refresh needed
    if (score > user.lifetimeHighScore) {
      await prisma.user.update({
        where: { id: user.id },
        // @ts-expect-error - Prisma type refresh needed
        data: { lifetimeHighScore: score }
      });
    }

    return NextResponse.json({ 
      success: true, 
      gameScore,
      // @ts-expect-error - Prisma type refresh needed
      newLifetimeRecord: score > user.lifetimeHighScore
    }, { status: 201 });
  } catch (error) {
    console.error('[ARCADE_SCORES_POST]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/arcade/scores?gameType=bot_memory_match&limit=10
 * Get user's personal best scores
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const gameType = searchParams.get('gameType') || 'bot_memory_match';
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user's scores
    const scores = await (prisma as any).gameScore.findMany({
      where: {
        userId: user.id,
        gameType
      },
      orderBy: {
        score: 'desc'
      },
      take: limit
    });

    // Get personal best
    const personalBest = scores[0] || null;

    return NextResponse.json({ scores, personalBest });
  } catch (error) {
    console.error('[ARCADE_SCORES_GET]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

