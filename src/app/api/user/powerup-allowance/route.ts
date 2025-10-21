import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if allowance needs to be reset (monthly)
    const now = new Date();
    let allowance = user.powerUpAllowance;
    let used = user.powerUpUsed;
    let resetAt = user.allowanceResetAt;

    if (resetAt && now > resetAt) {
      // Reset monthly allowance
      const nextMonth = new Date(now);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      
      await prisma.user.update({
        where: { id: user.id },
        data: {
          powerUpUsed: 0,
          allowanceResetAt: nextMonth,
        },
      });
      
      used = 0;
      resetAt = nextMonth;
    }

    return NextResponse.json({
      allowance,
      used,
      remaining: allowance - used,
      resetAt,
    });

  } catch (error) {
    console.error('[POWERUP_ALLOWANCE_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to get power-up allowance' },
      { status: 500 }
    );
  }
}
