import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ conversationId: string }> }
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

    const { conversationId } = await params;

    // Verify ownership and get conversation with active power-ups
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userId: user.id,
      },
      select: {
        activePowerUps: true,
      },
    });

    if (!conversation) {
      return new NextResponse('Conversation not found', { status: 404 });
    }

    return NextResponse.json({
      activePowerUps: conversation.activePowerUps || [],
    });
  } catch (error) {
    console.error('[GET_CONVERSATION_POWERUPS_ERROR]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

