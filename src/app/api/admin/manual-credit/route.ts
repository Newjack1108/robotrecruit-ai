import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const adminUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!adminUser) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Check if user is admin
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    const isAdmin = adminEmails.includes(adminUser.email);

    if (!isAdmin) {
      return new NextResponse('Forbidden: Admin access required', { status: 403 });
    }

    const { email, credits } = await req.json();

    if (!email || !credits) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Find the user to credit
    const targetUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Add credits
    const newAllowance = targetUser.powerUpAllowance + parseInt(credits);

    await prisma.user.update({
      where: { id: targetUser.id },
      data: {
        powerUpAllowance: newAllowance,
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: targetUser.id,
        type: 'powerup_purchase',
        title: 'Power-Up Credits Added! 🎉',
        message: `${credits} power-up credits have been added to your account. Start using advanced features now!`,
        link: '/chat',
      },
    });

    return NextResponse.json({
      success: true,
      message: `Added ${credits} credits to ${email}`,
      oldAllowance: targetUser.powerUpAllowance,
      newAllowance,
      remaining: newAllowance - targetUser.powerUpUsed,
    });
  } catch (error: any) {
    console.error('[ADMIN_CREDIT_ERROR]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to credit account' },
      { status: 500 }
    );
  }
}

