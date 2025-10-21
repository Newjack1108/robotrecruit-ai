import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/streaks
 * Get user's current streak information
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    }) as any;

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if streak is still valid (checked in yesterday or today)
    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let isStreakActive = false;
    let canCheckInToday = false;

    if (user.lastCheckIn) {
      const lastCheckIn = new Date(user.lastCheckIn);
      const lastCheckInDay = new Date(lastCheckIn.setHours(0, 0, 0, 0));

      // Streak is active if last check-in was today or yesterday
      isStreakActive = lastCheckInDay >= yesterday;

      // Can check in if haven't checked in today
      canCheckInToday = lastCheckInDay < today;
    } else {
      canCheckInToday = true;
    }

    return NextResponse.json({
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      totalCheckIns: user.totalCheckIns,
      streakPoints: user.streakPoints,
      lastCheckIn: user.lastCheckIn,
      isStreakActive,
      canCheckInToday,
    });
  } catch (error) {
    console.error('[STREAKS_GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch streak data' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/streaks/check-in
 * Check in for today's streak
 */
export async function POST() {
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

    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));

    // Check if already checked in today
    if (user.lastCheckIn) {
      const lastCheckIn = new Date(user.lastCheckIn);
      const lastCheckInDay = new Date(lastCheckIn.setHours(0, 0, 0, 0));

      if (lastCheckInDay.getTime() === today.getTime()) {
        return NextResponse.json({
          message: 'Already checked in today',
          currentStreak: user.currentStreak,
        });
      }
    }

    // Calculate new streak
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let newStreak = 1;

    if (user.lastCheckIn) {
      const lastCheckIn = new Date(user.lastCheckIn);
      const lastCheckInDay = new Date(lastCheckIn.setHours(0, 0, 0, 0));

      // Continue streak if last check-in was yesterday
      if (lastCheckInDay.getTime() === yesterday.getTime()) {
        newStreak = user.currentStreak + 1;
      }
    }

    // Calculate streak milestone rewards
    const streakRewards = {
      3: 50,   // 3 day streak = 50 bonus points
      7: 100,  // 7 day streak = 100 bonus points
      14: 250, // 14 day streak = 250 bonus points
      30: 500, // 30 day streak = 500 bonus points
      100: 1000, // 100 day streak = 1000 bonus points
    };

    let bonusPoints = 0;
    const milestoneReached = Object.entries(streakRewards).find(
      ([milestone]) => parseInt(milestone) === newStreak
    );

    if (milestoneReached) {
      bonusPoints = streakRewards[newStreak as keyof typeof streakRewards];
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { clerkId: userId },
      data: {
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, user.longestStreak),
        lastCheckIn: now,
        totalCheckIns: user.totalCheckIns + 1,
        streakPoints: user.streakPoints + bonusPoints,
      },
    }) as any;

    // Create notification for milestone if reached
    if (bonusPoints > 0) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'streak_milestone',
          title: `🔥 ${newStreak} Day Streak!`,
          message: `Amazing! You've maintained a ${newStreak} day streak and earned ${bonusPoints} bonus points!`,
          link: '/dashboard',
          isRead: false,
        },
      });
    }

    return NextResponse.json({
      message: 'Check-in successful!',
      currentStreak: updatedUser.currentStreak,
      longestStreak: updatedUser.longestStreak,
      totalCheckIns: updatedUser.totalCheckIns,
      streakPoints: updatedUser.streakPoints,
      bonusPoints,
      milestoneReached: bonusPoints > 0 ? newStreak : null,
    });
  } catch (error) {
    console.error('[STREAKS_CHECKIN_POST]', error);
    return NextResponse.json(
      { error: 'Failed to check in' },
      { status: 500 }
    );
  }
}

