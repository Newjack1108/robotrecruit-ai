import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { checkAchievements } from '@/lib/achievement-checker';
import { processReferralBotHire } from '@/lib/referral-processor';

// Hiring limits per tier
const TIER_LIMITS = {
  1: 2,  // Free: 2 bots
  2: 5,  // Pro: 5 bots
  3: 999, // Enterprise: unlimited (999 as practical limit)
};

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { botId } = await request.json();

    if (!botId) {
      return NextResponse.json({ error: 'Bot ID is required' }, { status: 400 });
    }

    // Get user with their current hires
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        hiredBots: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if bot exists
    const bot = await prisma.bot.findUnique({
      where: { id: botId },
    });

    if (!bot) {
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
    }

    // Check tier for hiring limit
    let effectiveTier = user.tier;
    if (user.promoTierUpgrade && user.promoExpiresAt) {
      if (new Date(user.promoExpiresAt) > new Date()) {
        effectiveTier = user.promoTierUpgrade;
      }
    }

    // Check if already hired
    const alreadyHired = user.hiredBots.some(hb => hb.botId === botId);
    if (alreadyHired) {
      return NextResponse.json(
        { error: 'Bot already hired' },
        { status: 400 }
      );
    }

    // Check hiring limit
    const hireLimit = TIER_LIMITS[effectiveTier as keyof typeof TIER_LIMITS] || TIER_LIMITS[1];
    if (user.hiredBots.length >= hireLimit) {
      return NextResponse.json(
        { 
          error: `You've reached your hiring limit (${hireLimit} bots). Upgrade to hire more bots!`,
          limit: hireLimit,
          current: user.hiredBots.length
        },
        { status: 403 }
      );
    }

    // Hire the bot
    await prisma.hiredBot.create({
      data: {
        userId: user.id,
        botId: botId,
      },
    });

    // Check for achievement unlocks (don't wait for it)
    checkAchievements(user.id).catch(err => 
      console.error('[ACHIEVEMENT_CHECK_ERROR]', err)
    );

    // Process referral bot hire reward (fire and forget)
    processReferralBotHire(user.id).catch(err =>
      console.error('[REFERRAL_BOT_HIRE_ERROR]', err)
    );

    // Track "hire_bot" challenge (fire and forget)
    fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/challenges/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'hire_bot' }),
    }).catch(err => console.error('[CHALLENGE_TRACK_ERROR]', err));

    return NextResponse.json({ 
      success: true,
      message: 'Bot hired successfully!',
      remaining: hireLimit - (user.hiredBots.length + 1)
    });

  } catch (error) {
    console.error('Error hiring bot:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { botId } = await request.json();

    if (!botId) {
      return NextResponse.json({ error: 'Bot ID is required' }, { status: 400 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fire the bot (delete the hiring record)
    const deleted = await prisma.hiredBot.deleteMany({
      where: {
        userId: user.id,
        botId: botId,
      },
    });

    if (deleted.count === 0) {
      return NextResponse.json(
        { error: 'Bot was not hired' },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'Bot fired successfully'
    });

  } catch (error) {
    console.error('Error firing bot:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

