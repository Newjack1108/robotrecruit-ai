import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

// Generate a unique 8-character referral code
function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars (0,O,1,I)
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Get tier referral limits
function getTierLimit(tier: number): number {
  const limits: Record<number, number> = {
    1: 2,      // Free
    2: 5,      // Pro
    3: 999999, // Premium (unlimited)
  };
  return limits[tier] || limits[1];
}

export async function POST() {
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
        referralsSent: true,
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
    const currentReferrals = user.referralsSent.length;

    // Check if user has reached their limit
    if (currentReferrals >= tierLimit) {
      return NextResponse.json(
        { 
          error: 'Referral limit reached',
          limit: tierLimit,
          current: currentReferrals,
          message: effectiveTier === 1 
            ? 'Upgrade to Pro or Premium to invite more friends!'
            : 'You have reached your referral limit for this tier.'
        },
        { status: 403 }
      );
    }

    // Generate unique code
    let referralCode = generateReferralCode();
    let attempts = 0;
    while (attempts < 10) {
      const existing = await prisma.referral.findUnique({
        where: { referralCode },
      });
      if (!existing) break;
      referralCode = generateReferralCode();
      attempts++;
    }

    if (attempts === 10) {
      return NextResponse.json(
        { error: 'Failed to generate unique code. Please try again.' },
        { status: 500 }
      );
    }

    // Create referral
    const referral = await prisma.referral.create({
      data: {
        referrerId: user.id,
        referralCode,
        status: 'pending',
      },
    });

    // Generate shareable URL (you'll need to update the domain in production)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const shareableUrl = `${baseUrl}/sign-up?ref=${referralCode}`;

    return NextResponse.json({
      success: true,
      referralCode,
      shareableUrl,
      remainingInvites: tierLimit - (currentReferrals + 1),
      tier: effectiveTier,
      tierLimit,
    });
  } catch (error) {
    console.error('[REFERRAL_GENERATE]', error);
    return NextResponse.json(
      { error: 'Failed to generate referral code' },
      { status: 500 }
    );
  }
}

