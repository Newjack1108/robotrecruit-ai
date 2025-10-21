import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

/**
 * POST /api/challenges/progress
 * Track progress towards today's challenge
 * Body: { action: string, metadata?: any }
 */
export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { action, metadata } = body;

    // Get today's challenge
    const today = new Date();
    const dayOfWeek = today.getDay();

    const challenge = await (prisma as any).dailyChallenge.findFirst({
      where: {
        dayOfWeek,
        isActive: true,
      },
    });

    if (!challenge) {
      return NextResponse.json({ message: 'No challenge today' });
    }

    const requirement = challenge.requirement as any;
    
    // Check if this action matches today's challenge
    if (requirement.type !== action) {
      return NextResponse.json({ message: 'Action does not match today\'s challenge' });
    }

    // Get or create today's completion record
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    let completion = await (prisma as any).userChallengeCompletion.findFirst({
      where: {
        userId: user.id,
        challengeId: challenge.id,
        completedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (!completion) {
      completion = await (prisma as any).userChallengeCompletion.create({
        data: {
          userId: user.id,
          challengeId: challenge.id,
          progress: 0,
          isCompleted: false,
          pointsEarned: 0,
        },
      });
    }

    // If already completed, no need to update
    if (completion.isCompleted) {
      return NextResponse.json({
        message: 'Challenge already completed',
        completion: {
          progress: completion.progress,
          isCompleted: completion.isCompleted,
          pointsEarned: completion.pointsEarned,
        },
      });
    }

    // Update progress based on requirement type
    let newProgress = completion.progress + 1;
    const requiredCount = requirement.count || 1;
    const isComplete = newProgress >= requiredCount;

    await (prisma as any).userChallengeCompletion.update({
      where: { id: completion.id },
      data: {
        progress: newProgress,
        isCompleted: isComplete,
        pointsEarned: isComplete ? challenge.points : 0,
      },
    });

    // If challenge is now complete, trigger achievements check
    if (isComplete) {
      // You can add achievement checking here later
      console.log(`[CHALLENGE_COMPLETE] User ${user.id} completed challenge ${challenge.key}`);
    }

    return NextResponse.json({
      message: isComplete ? 'Challenge completed!' : 'Progress updated',
      completion: {
        progress: newProgress,
        required: requiredCount,
        isCompleted: isComplete,
        pointsEarned: isComplete ? challenge.points : 0,
      },
    });
  } catch (error) {
    console.error('[CHALLENGE_PROGRESS_POST]', error);
    return NextResponse.json(
      { error: 'Failed to update challenge progress' },
      { status: 500 }
    );
  }
}

