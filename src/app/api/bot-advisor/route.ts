import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { openai } from '@/lib/openai';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { message } = body;

    if (!message) {
      return new NextResponse('Missing message', { status: 400 });
    }

    // Get Boss Bot details
    const bossBot = await prisma.bot.findUnique({
      where: { slug: 'boss-bot' },
    });

    if (!bossBot || !bossBot.openaiAssistantId || bossBot.openaiAssistantId.includes('REPLACE')) {
      return new NextResponse(
        'Bot Advisor is not configured. Please contact an administrator.',
        { status: 503 }
      );
    }

    // Get all bots for context
    const allBots = await prisma.bot.findMany({
      where: {
        isSystemBot: true,
        slug: { not: 'boss-bot' }, // Exclude Boss Bot from recommendations
      },
      select: {
        name: true,
        slug: true,
        description: true,
        knowledgeArea: true,
        tier: true,
      },
    });

    // Create enhanced system message with bot information
    const systemContext = `You are Boss Bot, an expert AI advisor helping users choose the right AI assistant for their needs. 

Available bots to recommend:
${allBots.map((bot) => `
- ${bot.name} (Tier ${bot.tier}, ${bot.tier === 1 ? 'FREE' : bot.tier === 2 ? 'PRO' : 'PREMIUM'}): ${bot.description}
  Knowledge Area: ${bot.knowledgeArea}
  Access: Click "${bot.name}" below
`).join('\n')}

Your job:
1. Listen to the user's needs and ask clarifying questions if needed
2. Recommend the most suitable bot(s) from the list above
3. Explain WHY that bot is perfect for them
4. Mention the tier requirement (FREE bots are available to everyone)
5. Be friendly, enthusiastic, and helpful
6. If they need business/strategic help, recommend Boss Bot (yourself) at /chat?bot=boss-bot

Keep responses under 120 words, conversational, and actionable. Use emojis sparingly.`;

    // Use OpenAI Chat Completions for temporary, stateless conversation
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: systemContext,
        },
        {
          role: 'user',
          content: message,
        },
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    const response = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

    return NextResponse.json({ response });
  } catch (error) {
    console.error('[BOT_ADVISOR_ERROR]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

