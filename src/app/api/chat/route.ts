import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendMessage, createThread } from '@/lib/openai';
import { performWebSearch, shouldPerformWebSearch } from '@/lib/web-search';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { message, botId, conversationId, imageUrl, fileId, activePowerUps } = body;

    if (!message || !botId) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const bot = await prisma.bot.findUnique({
      where: { id: botId },
    });

    if (!bot) {
      return new NextResponse('Bot not found', { status: 404 });
    }

    if (bot.tier > user.tier) {
      return new NextResponse('Upgrade required to access this bot', { status: 403 });
    }

    let conversation;
    let threadId: string | undefined;

    if (conversationId) {
      conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          userId: user.id,
        },
      });

      if (!conversation) {
        return new NextResponse('Conversation not found', { status: 404 });
      }

      // Use existing thread ID or create new one if missing
      if (conversation.threadId) {
        threadId = conversation.threadId;
      } else {
        try {
          threadId = await createThread();
          // Update conversation with new thread ID
          await prisma.conversation.update({
            where: { id: conversation.id },
            data: { threadId },
          });
        } catch (error) {
          console.error('[CHAT_ERROR] Failed to create thread:', error);
          return new NextResponse('Failed to create chat thread', { status: 500 });
        }
      }
    } else {
      try {
        threadId = await createThread();
        console.log('[CHAT_DEBUG] Created new thread:', threadId);
        
        conversation = await prisma.conversation.create({
          data: {
            userId: user.id,
            botId: bot.id,
            title: message.substring(0, 50),
            threadId: threadId,
          },
        });
        console.log('[CHAT_DEBUG] Created conversation with threadId:', conversation.threadId);
      } catch (error) {
        console.error('[CHAT_ERROR] Failed to create conversation:', error);
        return new NextResponse('Failed to create conversation', { status: 500 });
      }
    }

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: message,
      },
    });

    // Check if assistant ID is configured
    if (!bot.openaiAssistantId || bot.openaiAssistantId.includes('REPLACE')) {
      return new NextResponse(
        'This bot is not fully configured yet. Please contact an administrator to set up the OpenAI Assistant ID.',
        { status: 503 }
      );
    }

    // Check if image is provided but bot doesn't have image recognition enabled
    if (imageUrl && !bot.imageRecognition) {
      return new NextResponse(
        'This bot does not have image recognition enabled. Upgrade to use this feature!',
        { status: 403 }
      );
    }

    // Ensure threadId exists
    if (!threadId) {
      console.error('[CHAT_ERROR] ThreadID is undefined after conversation setup');
      console.error('[CHAT_ERROR] Conversation:', conversation);
      return new NextResponse('Failed to create chat thread', { status: 500 });
    }

    console.log('[CHAT_DEBUG] About to send message with threadId:', threadId);

    // Perform web search if Web Search power-up is active
    let enhancedMessage = message;
    const hasWebSearch = activePowerUps?.includes('webSearch');
    
    if (hasWebSearch) {
      // Add web search capability context
      if (shouldPerformWebSearch(message)) {
        console.log('[WEB_SEARCH] Performing web search for:', message);
        const searchResults = await performWebSearch(message);
        enhancedMessage = `[SYSTEM]: You have web search capabilities enabled. Here are current web search results:\n\n${searchResults}\n\n[USER QUESTION]: ${message}\n\n[INSTRUCTION]: Use the web search results above to provide an accurate, up-to-date answer. If the search results are relevant, cite them in your response.`;
        console.log('[WEB_SEARCH] Added search context to message');
      } else {
        // Even if we don't search, let the bot know it has the capability
        enhancedMessage = `[SYSTEM]: You have web search capabilities. If the user asks for current information, let them know you can search the web.\n\n[USER]: ${message}`;
      }
    }

    const assistantResponse = await sendMessage(
      threadId,
      bot.openaiAssistantId,
      enhancedMessage,
      imageUrl,
      fileId
    );

    const assistantMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: assistantResponse,
      },
    });

    // Track challenge progress for chat-related actions
    // (Fire and forget - don't wait for response)
    const trackChallenges = async () => {
      try {
        // Track "send_messages" challenge
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/challenges/progress`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'send_messages' }),
        });

        // Track "chat_unique_bots" challenge
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/challenges/progress`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'chat_unique_bots', metadata: { botId: bot.id } }),
        });

        // Track "use_powerup" challenge if power-ups are active
        if (activePowerUps && activePowerUps.length > 0) {
          await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/challenges/progress`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'use_powerup' }),
          });
        }
      } catch (error) {
        console.error('[CHALLENGE_TRACK_ERROR]', error);
      }
    };
    trackChallenges(); // Fire and forget

    return NextResponse.json({
      conversationId: conversation.id,
      message: assistantMessage,
    });
  } catch (error) {
    console.error('[CHAT_ERROR]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return new NextResponse('Conversation ID required', { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const messages = await prisma.message.findMany({
      where: {
        conversationId,
        conversation: {
          userId: user.id,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('[GET_MESSAGES_ERROR]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}