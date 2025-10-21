import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

async function isAdmin(userId: string) {
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) return false;

  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
  return adminEmails.includes(user.email);
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId || !(await isAdmin(userId))) {
      return new NextResponse('Forbidden: Admin access required', { status: 403 });
    }

    const body = await req.json();
    const { code, tierUpgrade, durationDays, maxUses, expiresInDays } = body;

    if (!code || !tierUpgrade || !durationDays) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    if (tierUpgrade < 1 || tierUpgrade > 3) {
      return new NextResponse('Invalid tier upgrade', { status: 400 });
    }

    // Check if code already exists
    const existing = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (existing) {
      return new NextResponse('Promo code already exists', { status: 400 });
    }

    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    const promoCode = await prisma.promoCode.create({
      data: {
        code: code.toUpperCase(),
        tierUpgrade,
        durationDays,
        maxUses: maxUses || null,
        expiresAt,
        createdBy: userId,
      },
    });

    return NextResponse.json(promoCode);
  } catch (error) {
    console.error('[ADMIN_PROMO_CREATE_ERROR]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId || !(await isAdmin(userId))) {
      return new NextResponse('Forbidden: Admin access required', { status: 403 });
    }

    const body = await req.json();
    const { id, isActive } = body;

    if (!id || isActive === undefined) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const promoCode = await prisma.promoCode.update({
      where: { id },
      data: { isActive },
    });

    return NextResponse.json(promoCode);
  } catch (error) {
    console.error('[ADMIN_PROMO_UPDATE_ERROR]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId || !(await isAdmin(userId))) {
      return new NextResponse('Forbidden: Admin access required', { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return new NextResponse('Missing ID', { status: 400 });
    }

    await prisma.promoCode.delete({
      where: { id },
    });

    return new NextResponse('Deleted', { status: 200 });
  } catch (error) {
    console.error('[ADMIN_PROMO_DELETE_ERROR]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}



