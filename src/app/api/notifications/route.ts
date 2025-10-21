import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET notifications for current user
export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20');

    if (unreadOnly) {
      // Return just the count for unread notifications
      const count = await prisma.notification.count({
        where: {
          userId: user.id,
          isRead: false,
        },
      });
      
      return NextResponse.json({ count });
    }

    // Fetch notifications
    const notifications = await prisma.notification.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return NextResponse.json({ notifications });
  } catch (error: any) {
    console.error('[NOTIFICATIONS_GET]', error);
    return new NextResponse(error.message || 'Internal Error', { status: 500 });
  }
}

