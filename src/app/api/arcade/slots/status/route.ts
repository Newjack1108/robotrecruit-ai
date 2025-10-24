import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

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

    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find or create today's spin record
    let dailySpins = await prisma.dailySlotSpins.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date: today,
        },
      },
    });

    if (!dailySpins) {
      // Create new daily spins record
      dailySpins = await prisma.dailySlotSpins.create({
        data: {
          userId: user.id,
          date: today,
          spinsUsed: 0,
          spinsTotal: 10,
          lastResetAt: new Date(),
        },
      });
    }

    // Calculate spins left
    const spinsLeft = dailySpins.spinsTotal - dailySpins.spinsUsed;

    // Calculate time until next reset
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const msToReset = tomorrow.getTime() - Date.now();
    const hoursToReset = Math.floor(msToReset / (1000 * 60 * 60));
    const minutesToReset = Math.floor((msToReset % (1000 * 60 * 60)) / (1000 * 60));

    return NextResponse.json({
      spinsLeft,
      spinsUsed: dailySpins.spinsUsed,
      spinsTotal: dailySpins.spinsTotal,
      timeToReset: `${hoursToReset}h ${minutesToReset}m`,
    });
  } catch (error) {
    console.error('[SLOTS_STATUS_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to fetch slot status' },
      { status: 500 }
    );
  }
}

