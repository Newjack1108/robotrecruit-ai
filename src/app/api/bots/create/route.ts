import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createAssistant } from '@/lib/openai';

export async function POST(req: Request) {
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

    // Check user tier
    let effectiveTier = user.tier;
    if (user.promoTierUpgrade && user.promoExpiresAt) {
      if (new Date(user.promoExpiresAt) > new Date()) {
        effectiveTier = user.promoTierUpgrade;
      }
    }

    if (effectiveTier < 2) {
      return new NextResponse('Upgrade required to create custom bots', { status: 403 });
    }

    const body = await req.json();
    const { name, description, knowledgeArea, instructions, imageUrl } = body;

    if (!name || !description || !knowledgeArea || !instructions) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Create slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Check if slug already exists
    const existing = await prisma.bot.findUnique({
      where: { slug },
    });

    if (existing) {
      return new NextResponse('A bot with this name already exists. Please choose a different name.', { status: 400 });
    }

    // Create OpenAI assistant first (vector store will be created when files are uploaded)
    const assistantId = await createAssistant(
      name,
      instructions,
      undefined // No vector store yet - created on first file upload
    );

    // Create bot in database
    const bot = await prisma.bot.create({
      data: {
        name,
        slug,
        description,
        knowledgeArea,
        imageUrl: imageUrl || '/bots/boss-bot.png', // Use uploaded image or default
        avatarUrl: imageUrl || '/bots/boss-bot-avatar.png', // Use same for avatar
        openaiAssistantId: assistantId,
        vectorStoreId: null, // Will be set when first file is uploaded
        isSystemBot: false,
        tier: 1, // Custom bots are accessible to creator regardless of tier
        creatorId: user.id,
      },
    });

    // Automatically hire (recruit) the custom bot for the creator
    await prisma.hiredBot.create({
      data: {
        userId: user.id,
        botId: bot.id,
      },
    });

    return NextResponse.json(bot);
  } catch (error: any) {
    console.error('[BOT_CREATE_ERROR]', error);
    return new NextResponse(error.message || 'Internal Error', { status: 500 });
  }
}



