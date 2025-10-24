import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        tier: true,
        stripeCustomerId: true,
        trialEndsAt: true,
        messageCount: true,
        dailyMessageLimit: true,
        lastMessageReset: true,
        createdAt: true,
        promoTierUpgrade: true,
        promoExpiresAt: true,
      },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const now = new Date();
    
    // Calculate effective tier (considering promo upgrades)
    let effectiveTier = user.tier;
    if (user.promoTierUpgrade && user.promoExpiresAt) {
      if (new Date(user.promoExpiresAt) > now) {
        effectiveTier = user.promoTierUpgrade;
      }
    }
    
    const isFreeUser = effectiveTier === 1 && !user.stripeCustomerId;
    
    // Calculate trial status
    let trialEndsAt = user.trialEndsAt;
    if (isFreeUser && !trialEndsAt) {
      // Initialize trial for existing users
      trialEndsAt = new Date(user.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000);
    }
    
    const trialExpired = trialEndsAt ? now > trialEndsAt : false;
    const trialDaysLeft = trialEndsAt && !trialExpired 
      ? Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    
    // Check if daily counter should reset
    const lastReset = user.lastMessageReset ? new Date(user.lastMessageReset) : null;
    const shouldReset = !lastReset || 
      lastReset.getDate() !== now.getDate() || 
      lastReset.getMonth() !== now.getMonth() || 
      lastReset.getFullYear() !== now.getFullYear();
    
    const messageCount = shouldReset ? 0 : user.messageCount;
    const messagesRemaining = Math.max(0, user.dailyMessageLimit - messageCount);
    
    return NextResponse.json({
      isFreeUser,
      isPremium: !isFreeUser,
      trial: {
        active: isFreeUser && !trialExpired,
        expired: isFreeUser && trialExpired,
        daysLeft: trialDaysLeft,
        endsAt: trialEndsAt,
      },
      messages: {
        sent: messageCount,
        limit: user.dailyMessageLimit,
        remaining: messagesRemaining,
        unlimited: !isFreeUser,
      },
    });
  } catch (error) {
    console.error('[TRIAL_STATUS_ERROR]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

