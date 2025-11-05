import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { processReferralSignup } from '@/lib/referral-processor';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { referralCode } = await req.json();

    if (!referralCode || typeof referralCode !== 'string') {
      return NextResponse.json(
        { error: 'Invalid referral code' },
        { status: 400 }
      );
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user already received welcome bonus
    if (user.welcomeBonusGiven) {
      return NextResponse.json(
        { error: 'Welcome bonus already claimed' },
        { status: 400 }
      );
    }

    // Process the referral
    const result = await processReferralSignup(user.id, referralCode);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to process referral' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Referral processed successfully',
    });
  } catch (error) {
    console.error('[REFERRAL_PROCESS_SIGNUP]', error);
    return NextResponse.json(
      { error: 'Failed to process referral' },
      { status: 500 }
    );
  }
}

