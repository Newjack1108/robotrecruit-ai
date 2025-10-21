import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { openai } from '@/lib/openai';

// DELETE a custom bot
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ botId: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { botId } = await params;

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Get the bot with all related data
    const bot = await prisma.bot.findUnique({
      where: { id: botId },
      include: {
        files: true,
        conversations: true,
      },
    });

    if (!bot) {
      return new NextResponse('Bot not found', { status: 404 });
    }

    // Check if user owns the bot (only custom bots can be deleted)
    if (bot.isSystemBot) {
      return new NextResponse('System bots cannot be deleted', { status: 403 });
    }

    if (bot.creatorId !== user.id) {
      return new NextResponse('You do not own this bot', { status: 403 });
    }

    // Delete all bot files from OpenAI
    for (const file of bot.files) {
      try {
        // Use del method for file deletion
        await (openai.files as any).del(file.openaiFileId);
      } catch (error) {
        console.error(`Failed to delete file ${file.openaiFileId} from OpenAI:`, error);
        // Continue anyway - file might already be deleted
      }
    }

    // Delete the vector store from OpenAI
    if (bot.vectorStoreId) {
      try {
        // vectorStores is at the top level of the client, not in beta
        await (openai as any).vectorStores.delete(bot.vectorStoreId);
      } catch (error) {
        console.error(`Failed to delete vector store ${bot.vectorStoreId} from OpenAI:`, error);
        // Continue anyway
      }
    }

    // Delete the assistant from OpenAI
    if (bot.openaiAssistantId) {
      try {
        await openai.beta.assistants.delete(bot.openaiAssistantId);
      } catch (error) {
        console.error(`Failed to delete assistant ${bot.openaiAssistantId} from OpenAI:`, error);
        // Continue anyway
      }
    }

    // Delete all related data from database (cascade should handle most of this)
    // But let's be explicit for important relationships
    await prisma.botFile.deleteMany({
      where: { botId: bot.id },
    });

    await prisma.message.deleteMany({
      where: {
        conversation: {
          botId: bot.id,
        },
      },
    });

    await prisma.conversation.deleteMany({
      where: { botId: bot.id },
    });

    await prisma.hiredBot.deleteMany({
      where: { botId: bot.id },
    });

    await prisma.userBotUpgrade.deleteMany({
      where: { botId: bot.id },
    });

    // Finally, delete the bot itself
    await prisma.bot.delete({
      where: { id: botId },
    });

    return NextResponse.json({ 
      success: true,
      message: 'Bot deleted successfully'
    });

  } catch (error) {
    console.error('[DELETE_BOT_ERROR]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

// GET a single bot (for editing/viewing)
export async function GET(
  req: Request,
  { params }: { params: Promise<{ botId: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { botId } = await params;

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const bot = await prisma.bot.findUnique({
      where: { id: botId },
      include: {
        files: true,
      },
    });

    if (!bot) {
      return new NextResponse('Bot not found', { status: 404 });
    }

    // Only allow viewing custom bots owned by the user or system bots
    if (!bot.isSystemBot && bot.creatorId !== user.id) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    return NextResponse.json(bot);

  } catch (error) {
    console.error('[GET_BOT_ERROR]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

// PATCH - Update a custom bot
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ botId: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { botId } = await params;

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

    // Check if user owns the bot (only custom bots can be updated)
    if (bot.isSystemBot) {
      return new NextResponse('System bots cannot be updated', { status: 403 });
    }

    if (bot.creatorId !== user.id) {
      return new NextResponse('You do not own this bot', { status: 403 });
    }

    const body = await req.json();
    const { name, description, knowledgeArea, instructions, imageUrl } = body;

    // Note: Bot schema doesn't have a separate 'instructions' field stored in DB
    // Instructions are only stored in the OpenAI assistant itself
    // We can update the assistant but don't need to store instructions separately

    // Update the OpenAI assistant if instructions changed
    if (instructions && bot.openaiAssistantId) {
      try {
        await openai.beta.assistants.update(bot.openaiAssistantId, {
          name: name || bot.name,
          instructions: instructions,
        });
      } catch (error) {
        console.error('Failed to update OpenAI assistant:', error);
        return new NextResponse('Failed to update assistant', { status: 500 });
      }
    }

    // Update the bot in database
    const updatedBot = await prisma.bot.update({
      where: { id: botId },
      data: {
        name: name || bot.name,
        description: description || bot.description,
        knowledgeArea: knowledgeArea || bot.knowledgeArea,
        imageUrl: imageUrl !== undefined ? imageUrl : bot.imageUrl,
      },
    });

    return NextResponse.json(updatedBot);

  } catch (error) {
    console.error('[PATCH_BOT_ERROR]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

