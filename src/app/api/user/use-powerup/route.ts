import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { botId, powerUpType, conversationId } = await request.json();

    if (!botId || !powerUpType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if allowance needs to be reset (monthly)
    const now = new Date();
    let powerUpUsed = user.powerUpUsed;
    let powerUpAllowance = user.powerUpAllowance;

    if (user.allowanceResetAt && now > user.allowanceResetAt) {
      // Reset monthly allowance
      const nextResetDate = new Date(now);
      nextResetDate.setMonth(nextResetDate.getMonth() + 1);

      await prisma.user.update({
        where: { clerkId: clerkUserId },
        data: {
          powerUpUsed: 0,
          allowanceResetAt: nextResetDate,
        },
      });

      powerUpUsed = 0;
    }

    // Check if user has remaining allowance
    if (powerUpUsed >= powerUpAllowance) {
      return NextResponse.json(
        { 
          message: '⚡ Out of Power-Ups! Upgrade your plan to get more monthly power-ups.',
          allowance: powerUpAllowance,
          used: powerUpUsed,
        },
        { status: 403 }
      );
    }

    // Record power-up usage
    await prisma.powerUpUsage.create({
      data: {
        userId: user.id,
        botId,
        powerUpType,
        conversationId: conversationId || null,
      },
    });

    // Increment usage counter
    const updatedUser = await prisma.user.update({
      where: { clerkId: clerkUserId },
      data: {
        powerUpUsed: {
          increment: 1,
        },
      },
      select: {
        powerUpAllowance: true,
        powerUpUsed: true,
      },
    });

    return NextResponse.json({
      success: true,
      allowance: updatedUser.powerUpAllowance,
      used: updatedUser.powerUpUsed,
    });
  } catch (error) {
    console.error('[USE_POWERUP_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

