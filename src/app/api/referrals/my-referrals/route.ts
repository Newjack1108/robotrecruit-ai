import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

// Get tier referral limits
function getTierLimit(tier: number): number {
  const limits: Record<number, number> = {
    1: 2,      // Free
    2: 5,      // Pro
    3: 999999, // Premium (unlimited)
  };
  return limits[tier] || limits[1];
}

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
      include: {
        referralsSent: {
          include: {
            invitedUser: {
              select: {
                email: true,
                createdAt: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check effective tier (including promo)
    let effectiveTier = user.tier;
    if (user.promoTierUpgrade && user.promoExpiresAt) {
      if (new Date(user.promoExpiresAt) > new Date()) {
        effectiveTier = user.promoTierUpgrade;
      }
    }

    const tierLimit = getTierLimit(effectiveTier);

    // Calculate stats
    const totalReferrals = user.referralsSent.length;
    const pendingReferrals = user.referralsSent.filter(r => r.status === 'pending').length;
    const signedUpReferrals = user.referralsSent.filter(r => r.status === 'signed_up' || r.status === 'bot_hired' || r.status === 'completed').length;
    const hiredBotReferrals = user.referralsSent.filter(r => r.status === 'bot_hired' || r.status === 'completed').length;

    // Calculate rewards earned
    const pointsEarned = (signedUpReferrals * 50) + (hiredBotReferrals * 50);
    const creditsEarned = hiredBotReferrals * 20;

    // Format referrals for response
    const referrals = user.referralsSent.map(ref => ({
      id: ref.id,
      code: ref.referralCode,
      status: ref.status,
      invitedEmail: ref.invitedUser?.email || ref.invitedEmail || 'Pending',
      createdAt: ref.createdAt,
      signedUpAt: ref.signedUpAt,
      firstBotHiredAt: ref.firstBotHiredAt,
      signupRewardGiven: ref.signupRewardGiven,
      hireRewardGiven: ref.hireRewardGiven,
    }));

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    return NextResponse.json({
      success: true,
      stats: {
        total: totalReferrals,
        pending: pendingReferrals,
        signedUp: signedUpReferrals,
        hiredBot: hiredBotReferrals,
        pointsEarned,
        creditsEarned,
      },
      limits: {
        tier: effectiveTier,
        limit: tierLimit,
        remaining: Math.max(0, tierLimit - totalReferrals),
      },
      referrals,
      baseUrl,
    });
  } catch (error) {
    console.error('[REFERRAL_MY_REFERRALS]', error);
    return NextResponse.json(
      { error: 'Failed to fetch referrals' },
      { status: 500 }
    );
  }
}

