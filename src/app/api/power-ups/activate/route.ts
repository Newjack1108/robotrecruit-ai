import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { botId, powerUpType, conversationId } = await req.json();

    if (!botId || !powerUpType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get user with their power-up allowance
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
    let currentAllowance = user.powerUpAllowance;
    let currentUsed = user.powerUpUsed;
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
      
      currentUsed = 0;
      resetAt = nextMonth;
    }

    // Check if user has allowance remaining
    if (currentUsed >= currentAllowance) {
      return NextResponse.json(
        { 
          error: 'Insufficient power-up credits',
          remaining: 0,
          total: currentAllowance,
        },
        { status: 403 }
      );
    }

    // Check if user has the bot hired
    const hiredBot = await prisma.hiredBot.findUnique({
      where: {
        userId_botId: {
          userId: user.id,
          botId: botId,
        },
      },
    });

    if (!hiredBot) {
      return NextResponse.json(
        { error: 'Bot not hired' },
        { status: 403 }
      );
    }

    // Check if user has purchased this upgrade for this bot
    const hasUpgrade = await prisma.userBotUpgrade.findUnique({
      where: {
        userId_botId_upgradeType: {
          userId: user.id,
          botId: botId,
          upgradeType: powerUpType,
        },
      },
    });

    const bot = await prisma.bot.findUnique({
      where: { id: botId },
    });

    if (!bot) {
      return NextResponse.json(
        { error: 'Bot not found' },
        { status: 404 }
      );
    }

    // Check if bot has this power-up natively or user purchased it
    const botHasPowerUp = (bot as any)[powerUpType] === true;
    
    if (!botHasPowerUp && !hasUpgrade) {
      return NextResponse.json(
        { error: 'Power-up not available for this bot' },
        { status: 403 }
      );
    }

    // Check if power-up is already activated for this conversation
    let shouldChargeCredit = true;
    
    if (conversationId) {
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          userId: user.id,
        },
      });

      if (conversation) {
        const activePowerUps = ((conversation as any).activePowerUps as string[]) || [];
        
        // If already activated for this conversation, don't charge again
        if (activePowerUps.includes(powerUpType)) {
          shouldChargeCredit = false;
          console.log(`[POWER_UP] ${powerUpType} already activated for conversation ${conversationId}, not charging credit`);
        } else {
          // Add to conversation's active power-ups
          const updatedPowerUps = [...activePowerUps, powerUpType];
          await prisma.conversation.update({
            where: { id: conversationId },
            data: {
              activePowerUps: updatedPowerUps,
            } as any,
          });
          console.log(`[POWER_UP] Added ${powerUpType} to conversation ${conversationId}`);
        }
      }
    }

    // Only charge credit and record usage if this is the first activation for this conversation
    if (shouldChargeCredit) {
      // Record power-up usage
      await prisma.powerUpUsage.create({
        data: {
          userId: user.id,
          botId: botId,
          powerUpType: powerUpType,
          conversationId: conversationId,
        },
      });

      // Increment power-up usage count
      await prisma.user.update({
        where: { id: user.id },
        data: {
          powerUpUsed: currentUsed + 1,
        },
      });
    }

    return NextResponse.json({
      success: true,
      remaining: shouldChargeCredit ? currentAllowance - currentUsed - 1 : currentAllowance - currentUsed,
      total: currentAllowance,
      message: shouldChargeCredit 
        ? `${powerUpType} activated successfully!` 
        : `${powerUpType} already active for this conversation`,
      alreadyActive: !shouldChargeCredit,
    });

  } catch (error) {
    console.error('[POWER_UP_ACTIVATE_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to activate power-up' },
      { status: 500 }
    );
  }
}

