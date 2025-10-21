import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

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
    const botId = searchParams.get('botId');

    if (!botId) {
      return new NextResponse('Bot ID required', { status: 400 });
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        userId: user.id,
        botId: botId,
      },
      include: {
        _count: {
          select: { messages: true },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    const formattedConversations = conversations.map((conv) => ({
      id: conv.id,
      title: conv.title,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
      messageCount: conv._count.messages,
    }));

    return NextResponse.json(formattedConversations);
  } catch (error) {
    console.error('[GET_CONVERSATIONS_ERROR]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

