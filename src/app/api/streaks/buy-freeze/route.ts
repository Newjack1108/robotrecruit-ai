import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

const FREEZE_COST = 5; // Power-up credits per freeze

/**
 * POST /api/streaks/buy-freeze
 * Purchase a streak freeze with power-up credits
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

    // Parse quantity from request body (default to 1)
    const body = await request.json().catch(() => ({}));
    const quantity = body.quantity || 1;

    if (quantity < 1 || quantity > 10) {
      return NextResponse.json(
        { error: 'Invalid quantity. Must be between 1 and 10.' },
        { status: 400 }
      );
    }

    const totalCost = FREEZE_COST * quantity;

    // Check if user has enough credits
    const availableCredits = user.powerUpAllowance - user.powerUpUsed;
    if (availableCredits < totalCost) {
      return NextResponse.json(
        {
          error: 'Insufficient power-up credits',
          required: totalCost,
          available: availableCredits,
        },
        { status: 400 }
      );
    }

    // Deduct credits and add freezes
    const updatedUser = await prisma.user.update({
      where: { clerkId: userId },
      data: {
        powerUpUsed: user.powerUpUsed + totalCost,
        streakFreezes: (user.streakFreezes || 0) + quantity,
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'freeze_purchased',
        title: '❄️ Streak Freeze Purchased!',
        message: `You purchased ${quantity} streak freeze${quantity > 1 ? 's' : ''} for ${totalCost} credits. Your streak is now protected!`,
        link: '/dashboard',
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully purchased ${quantity} streak freeze${quantity > 1 ? 's' : ''}`,
      streakFreezes: updatedUser.streakFreezes,
      creditsUsed: totalCost,
      remainingCredits: user.powerUpAllowance - updatedUser.powerUpUsed,
    });
  } catch (error) {
    console.error('[BUY_FREEZE_POST]', error);
    return NextResponse.json(
      { error: 'Failed to purchase streak freeze' },
      { status: 500 }
    );
  }
}

