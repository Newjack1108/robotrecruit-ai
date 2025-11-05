import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { code } = await req.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Invalid referral code' },
        { status: 400 }
      );
    }

    // Find the referral
    const referral = await prisma.referral.findUnique({
      where: { referralCode: code.toUpperCase() },
      include: {
        referrerUser: {
          select: {
            email: true,
            clerkId: true,
          },
        },
      },
    });

    if (!referral) {
      return NextResponse.json(
        { error: 'Invalid referral code', valid: false },
        { status: 404 }
      );
    }

    // Check if already used (has an invited user)
    if (referral.invitedUserId) {
      return NextResponse.json(
        { error: 'This referral code has already been used', valid: false },
        { status: 400 }
      );
    }

    // Get referrer email (mask it for privacy)
    const referrerEmail = referral.referrerUser.email;
    const maskedEmail = referrerEmail.replace(/(.{2})(.*)(@.*)/, '$1***$3');

    return NextResponse.json({
      valid: true,
      referralCode: referral.referralCode,
      referrerId: referral.referrerId,
      referrerEmail: maskedEmail,
      message: `You were invited by ${maskedEmail}`,
    });
  } catch (error) {
    console.error('[REFERRAL_VALIDATE]', error);
    return NextResponse.json(
      { error: 'Failed to validate referral code' },
      { status: 500 }
    );
  }
}

