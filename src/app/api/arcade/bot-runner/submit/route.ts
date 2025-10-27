import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

/**
 * POST /api/arcade/bot-runner/submit
 * Submit Bot Runner game score
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { score, tasksCollected, totalTasks, bugsDebugged, timeRemaining, livesRemaining } = body;

    // Validate required fields
    if (
      typeof score !== 'number' || 
      typeof tasksCollected !== 'number' || 
      typeof bugsDebugged !== 'number'
    ) {
      return NextResponse.json(
        { error: 'Missing or invalid required fields' },
        { status: 400 }
      );
    }

    // Basic server-side validation
    if (score < 0 || score > 50000) {
      return NextResponse.json(
        { error: 'Invalid score' },
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
        gameType: 'bot_runner',
        score,
        moves: tasksCollected, // Use tasks collected as "moves"
        timeSeconds: 120 - timeRemaining, // Time taken
        difficulty: 'normal',
        metadata: {
          tasksCollected,
          totalTasks,
          bugsDebugged,
          livesRemaining,
          timeRemaining,
          completionRate: Math.round((tasksCollected / totalTasks) * 100),
        }
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
    console.error('[BOT_RUNNER_SUBMIT]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

