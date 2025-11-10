import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/friends
 * Get list of user's friends
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

    // Get friendships where user is either the user or friend
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { userId: user.id },
          { friendId: user.id },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            clerkId: true,
            currentStreak: true,
            longestStreak: true,
            streakPoints: true,
            lifetimeHighScore: true,
          },
        },
        friend: {
          select: {
            id: true,
            email: true,
            clerkId: true,
            currentStreak: true,
            longestStreak: true,
            streakPoints: true,
            lifetimeHighScore: true,
          },
        },
      },
    });

    // Map to friend data (exclude self)
    const friends = friendships.map((friendship) => {
      const friendData = friendship.userId === user.id ? friendship.friend : friendship.user;
      return {
        friendshipId: friendship.id,
        userId: friendData.id,
        email: friendData.email,
        clerkId: friendData.clerkId,
        stats: {
          currentStreak: friendData.currentStreak,
          longestStreak: friendData.longestStreak,
          streakPoints: friendData.streakPoints,
          highScore: friendData.lifetimeHighScore,
        },
        friendedAt: friendship.createdAt,
      };
    });

    return NextResponse.json({ friends });
  } catch (error) {
    console.error('[FRIENDS_GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch friends' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/friends
 * Send a friend request
 * Body: { email: string }
 */
export async function POST(request: Request) {
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

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // Can't friend yourself
    if (email === user.email) {
      return NextResponse.json({ error: 'Cannot send friend request to yourself' }, { status: 400 });
    }

    // Find target user
    const targetUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found with that email' }, { status: 404 });
    }

    // Check if already friends
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId: user.id, friendId: targetUser.id },
          { userId: targetUser.id, friendId: user.id },
        ],
      },
    });

    if (existingFriendship) {
      return NextResponse.json({ error: 'Already friends with this user' }, { status: 400 });
    }

    // Check if request already exists
    const existingRequest = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { senderId: user.id, receiverId: targetUser.id },
          { senderId: targetUser.id, receiverId: user.id },
        ],
        status: 'pending',
      },
    });

    if (existingRequest) {
      return NextResponse.json({ error: 'Friend request already pending' }, { status: 400 });
    }

    // Create friend request
    const friendRequest = await prisma.friendRequest.create({
      data: {
        senderId: user.id,
        receiverId: targetUser.id,
        status: 'pending',
      },
    });

    // Create notification for receiver
    await prisma.notification.create({
      data: {
        userId: targetUser.id,
        type: 'friend_request',
        title: '👥 New Friend Request',
        message: `${user.email} sent you a friend request!`,
        link: '/friends',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Friend request sent!',
      requestId: friendRequest.id,
    });
  } catch (error) {
    console.error('[FRIENDS_POST]', error);
    return NextResponse.json(
      { error: 'Failed to send friend request' },
      { status: 500 }
    );
  }
}

