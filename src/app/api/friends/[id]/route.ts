import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

/**
 * POST /api/friends/[id]
 * Accept a friend request
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id: requestId } = await params;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find the friend request
    const friendRequest = await prisma.friendRequest.findUnique({
      where: { id: requestId },
      include: {
        sender: true,
        receiver: true,
      },
    });

    if (!friendRequest) {
      return NextResponse.json({ error: 'Friend request not found' }, { status: 404 });
    }

    // Verify user is the receiver
    if (friendRequest.receiverId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized to accept this request' }, { status: 403 });
    }

    // Check if already accepted
    if (friendRequest.status !== 'pending') {
      return NextResponse.json({ error: 'Request already processed' }, { status: 400 });
    }

    // Create friendship
    const friendship = await prisma.friendship.create({
      data: {
        userId: friendRequest.senderId,
        friendId: friendRequest.receiverId,
      },
    });

    // Update request status
    await prisma.friendRequest.update({
      where: { id: requestId },
      data: { status: 'accepted' },
    });

    // Notify sender that request was accepted
    await prisma.notification.create({
      data: {
        userId: friendRequest.senderId,
        type: 'friend_accepted',
        title: '✅ Friend Request Accepted!',
        message: `${user.email} accepted your friend request!`,
        link: '/friends',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Friend request accepted!',
      friendshipId: friendship.id,
    });
  } catch (error) {
    console.error('[FRIEND_ACCEPT_POST]', error);
    return NextResponse.json(
      { error: 'Failed to accept friend request' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/friends/[id]
 * Reject a friend request OR remove an existing friendship
 * Query param: type=request (reject request) or type=friend (remove friend)
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'request';

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (type === 'request') {
      // Reject friend request
      const friendRequest = await prisma.friendRequest.findUnique({
        where: { id },
      });

      if (!friendRequest) {
        return NextResponse.json({ error: 'Friend request not found' }, { status: 404 });
      }

      // Verify user is the receiver
      if (friendRequest.receiverId !== user.id) {
        return NextResponse.json({ error: 'Unauthorized to reject this request' }, { status: 403 });
      }

      // Update request status
      await prisma.friendRequest.update({
        where: { id },
        data: { status: 'rejected' },
      });

      return NextResponse.json({
        success: true,
        message: 'Friend request rejected',
      });
    } else {
      // Remove friendship
      const friendship = await prisma.friendship.findUnique({
        where: { id },
      });

      if (!friendship) {
        return NextResponse.json({ error: 'Friendship not found' }, { status: 404 });
      }

      // Verify user is part of friendship
      if (friendship.userId !== user.id && friendship.friendId !== user.id) {
        return NextResponse.json({ error: 'Unauthorized to remove this friendship' }, { status: 403 });
      }

      // Delete friendship
      await prisma.friendship.delete({
        where: { id },
      });

      return NextResponse.json({
        success: true,
        message: 'Friend removed',
      });
    }
  } catch (error) {
    console.error('[FRIEND_DELETE]', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

