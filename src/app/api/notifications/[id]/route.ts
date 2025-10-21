import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// PATCH mark single notification as read
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await req.json();

    // Verify notification belongs to user
    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification || notification.userId !== user.id) {
      return new NextResponse('Notification not found', { status: 404 });
    }

    // Update notification
    const updated = await prisma.notification.update({
      where: { id },
      data: {
        isRead: body.isRead ?? true,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('[NOTIFICATION_PATCH]', error);
    return new NextResponse(error.message || 'Internal Error', { status: 500 });
  }
}

// DELETE notification
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Verify notification belongs to user
    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification || notification.userId !== user.id) {
      return new NextResponse('Notification not found', { status: 404 });
    }

    await prisma.notification.delete({
      where: { id },
    });

    return new NextResponse('Notification deleted', { status: 200 });
  } catch (error: any) {
    console.error('[NOTIFICATION_DELETE]', error);
    return new NextResponse(error.message || 'Internal Error', { status: 500 });
  }
}

