import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { calculateUserStats } from '@/lib/achievement-checker';

// GET user stats and achievements
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Calculate stats
    const stats = await calculateUserStats(user.id);

    // Get unlocked achievements with details
    const unlockedAchievements = await prisma.userAchievement.findMany({
      where: { userId: user.id },
      include: {
        achievement: true,
      },
      orderBy: {
        unlockedAt: 'desc',
      },
    });

    // Get all achievements for progress tracking
    const allAchievements = await prisma.achievement.findMany({
      orderBy: [
        { category: 'asc' },
        { tier: 'asc' },
        { points: 'asc' },
      ],
    });

    return NextResponse.json({
      stats,
      unlockedAchievements,
      allAchievements,
      user: {
        id: user.id,
        email: user.email,
        tier: user.tier,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    console.error('[USER_STATS_GET]', error);
    return new NextResponse(error.message || 'Internal Error', { status: 500 });
  }
}

