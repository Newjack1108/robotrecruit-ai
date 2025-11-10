import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { openai } from '@/lib/openai';

interface RecapResponse {
  summary: string;
  highlights: string[];
  next_steps: string[];
}

function buildPrompt(dialogue: string) {
  return [
    {
      role: 'system' as const,
      content:
        'You are a friendly productivity coach summarizing a chat between a user and their AI assistant. ' +
        'Return concise results in JSON with keys "summary" (1 paragraph), "highlights" (array of 2-3 bullet strings), ' +
        '"next_steps" (array of 2-3 actionable suggestions). Keep tone upbeat, practical, and under 600 characters total.',
    },
    {
      role: 'user' as const,
      content: `Here is the conversation transcript:\n\n${dialogue}\n\nProvide the JSON response now.`,
    },
  ];
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { conversationId } = body as { conversationId?: string };

    if (!conversationId) {
      return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 });
    }

    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        user: {
          clerkId: userId,
        },
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 50,
        },
        bot: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    if (!conversation.messages.length) {
      return NextResponse.json({ error: 'No messages to summarize yet' }, { status: 400 });
    }

    const dialogue = conversation.messages
      .map((message) => {
        const speaker = message.role === 'user' ? 'User' : conversation.bot?.name ?? 'Bot';
        return `${speaker}: ${message.content}`;
      })
      .join('\n');

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.7,
      messages: buildPrompt(dialogue),
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content returned from OpenAI');
    }

    const parsed = JSON.parse(content) as RecapResponse;

    return NextResponse.json({
      summary: parsed.summary,
      highlights: parsed.highlights ?? [],
      nextSteps: parsed.next_steps ?? [],
    });
  } catch (error: any) {
    console.error('[CHAT_RECAP_ERROR]', error);
    const message = error?.message ?? 'Failed to generate recap';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


