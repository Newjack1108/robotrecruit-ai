import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET: Retrieve all tool data across all conversations for the current user
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all tool data for user's conversations
    // @ts-expect-error - Prisma type needs refresh
    const toolData = await prisma.botToolData.findMany({
      where: {
        conversation: {
          userId: user.id,
        },
      },
      include: {
        conversation: {
          include: {
            bot: {
              select: {
                id: true,
                name: true,
                slug: true,
                avatarUrl: true,
                imageUrl: true,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(toolData);
  } catch (error) {
    console.error('Error fetching user tool data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

