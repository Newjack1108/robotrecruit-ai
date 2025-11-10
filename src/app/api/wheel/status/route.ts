import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/wheel/status
 * Get user's daily wheel spin status
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

    // Check if spins need to be reset (new day)
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let spinsRemaining = user.dailySpinsRemaining;
    let needsReset = false;

    if (user.lastDailySpinAt) {
      const lastSpinDate = new Date(user.lastDailySpinAt);
      const lastSpinDay = new Date(
        lastSpinDate.getFullYear(),
        lastSpinDate.getMonth(),
        lastSpinDate.getDate()
      );

      // If last spin was before today, reset spins
      if (lastSpinDay < today) {
        needsReset = true;
      }
    } else {
      // Never spun before, ensure they have spins
      needsReset = spinsRemaining === 0;
    }

    // Calculate bonus spins
    let baseSp

ins = 1;
    let bonusSpins = 0;
    const bonusReasons = [];

    // Bonus: 7+ day streak
    if (user.currentStreak >= 7) {
      bonusSpins += 1;
      bonusReasons.push('7+ day streak');
    }

    // Check if user completed today's challenge
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setHours(23, 59, 59, 999);

    const todayChallenge = await (prisma as any).userChallengeCompletion.findFirst({
      where: {
        userId: user.id,
        isCompleted: true,
        completedAt: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    });

    if (todayChallenge) {
      bonusSpins += 1;
      bonusReasons.push('completed daily challenge');
    }

    const totalSpins = baseSpins + bonusSpins;

    // Reset spins if needed
    if (needsReset) {
      const updatedUser = await prisma.user.update({
        where: { clerkId: userId },
        data: {
          dailySpinsRemaining: totalSpins,
        },
      });
      spinsRemaining = updatedUser.dailySpinsRemaining;
    }

    return NextResponse.json({
      spinsRemaining,
      baseSpins,
      bonusSpins,
      bonusReasons,
      totalSpins,
      lastSpinAt: user.lastDailySpinAt,
      canSpin: spinsRemaining > 0,
    });
  } catch (error) {
    console.error('[WHEEL_STATUS_GET]', error);
    return NextResponse.json(
      { error: 'Failed to get wheel status' },
      { status: 500 }
    );
  }
}

