import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/challenges/today
 * Get today's daily challenge and user's progress
 */
export async function GET() {
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

    // Get today's day of week (0 = Sunday, 1 = Monday, etc.)
    const today = new Date();
    const dayOfWeek = today.getDay();

    // Get today's challenge
    const challenge = await (prisma as any).dailyChallenge.findFirst({
      where: {
        dayOfWeek,
        isActive: true,
      },
    });

    if (!challenge) {
      return NextResponse.json({ error: 'No challenge for today' }, { status: 404 });
    }

    // Check if user has completed today's challenge
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const completion = await (prisma as any).userChallengeCompletion.findFirst({
      where: {
        userId: user.id,
        challengeId: challenge.id,
        completedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    return NextResponse.json({
      challenge: {
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        points: challenge.points,
        icon: challenge.icon,
        requirement: challenge.requirement,
      },
      completion: completion ? {
        progress: completion.progress,
        isCompleted: completion.isCompleted,
        pointsEarned: completion.pointsEarned,
      } : null,
    });
  } catch (error) {
    console.error('[CHALLENGE_TODAY_GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch today\'s challenge' },
      { status: 500 }
    );
  }
}

