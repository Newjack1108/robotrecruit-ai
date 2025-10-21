import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { code } = body;

    if (!code) {
      return new NextResponse('Promo code required', { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Find the promo code
    const promoCode = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        _count: {
          select: {
            redemptions: true,
          },
        },
      },
    });

    if (!promoCode) {
      return new NextResponse('Invalid promo code', { status: 404 });
    }

    // Check if code is active
    if (!promoCode.isActive) {
      return new NextResponse('This promo code is no longer active', { status: 400 });
    }

    // Check if code has expired
    if (promoCode.expiresAt && new Date(promoCode.expiresAt) < new Date()) {
      return new NextResponse('This promo code has expired', { status: 400 });
    }

    // Check if max uses reached
    if (promoCode.maxUses && promoCode._count.redemptions >= promoCode.maxUses) {
      return new NextResponse('This promo code has reached its maximum uses', { status: 400 });
    }

    // Check if user already redeemed this code
    const existingRedemption = await prisma.promoRedemption.findUnique({
      where: {
        userId_promoCodeId: {
          userId: user.id,
          promoCodeId: promoCode.id,
        },
      },
    });

    if (existingRedemption) {
      return new NextResponse('You have already redeemed this promo code', { status: 400 });
    }

    // Calculate expiry date
    const expiresAt = new Date(Date.now() + promoCode.durationDays * 24 * 60 * 60 * 1000);

    // Create redemption and update user
    await prisma.$transaction([
      // Create redemption record
      prisma.promoRedemption.create({
        data: {
          userId: user.id,
          promoCodeId: promoCode.id,
          expiresAt,
        },
      }),
      // Update promo code used count
      prisma.promoCode.update({
        where: { id: promoCode.id },
        data: {
          usedCount: {
            increment: 1,
          },
        },
      }),
      // Update user tier
      prisma.user.update({
        where: { id: user.id },
        data: {
          promoTierUpgrade: promoCode.tierUpgrade,
          promoExpiresAt: expiresAt,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      tierUpgrade: promoCode.tierUpgrade,
      expiresAt,
      durationDays: promoCode.durationDays,
    });
  } catch (error) {
    console.error('[PROMO_REDEEM_ERROR]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}



