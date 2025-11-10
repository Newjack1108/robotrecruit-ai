import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/friends/requests
 * Get pending friend requests (received and sent)
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get received requests (pending)
    const receivedRequests = await prisma.friendRequest.findMany({
      where: {
        receiverId: user.id,
        status: 'pending',
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            clerkId: true,
            currentStreak: true,
            longestStreak: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get sent requests (pending)
    const sentRequests = await prisma.friendRequest.findMany({
      where: {
        senderId: user.id,
        status: 'pending',
      },
      include: {
        receiver: {
          select: {
            id: true,
            email: true,
            clerkId: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      received: receivedRequests.map((req) => ({
        id: req.id,
        fromUser: {
          id: req.sender.id,
          email: req.sender.email,
          clerkId: req.sender.clerkId,
          currentStreak: req.sender.currentStreak,
          longestStreak: req.sender.longestStreak,
        },
        createdAt: req.createdAt,
      })),
      sent: sentRequests.map((req) => ({
        id: req.id,
        toUser: {
          id: req.receiver.id,
          email: req.receiver.email,
          clerkId: req.receiver.clerkId,
        },
        createdAt: req.createdAt,
      })),
    });
  } catch (error) {
    console.error('[FRIEND_REQUESTS_GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch friend requests' },
      { status: 500 }
    );
  }
}

