import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { openai } from '@/lib/openai';

// Upload a file to a bot
export async function POST(
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

    // Check if user owns the bot
    if (bot.creatorId !== user.id && bot.isSystemBot) {
      return new NextResponse('Forbidden: You can only add files to your own bots', { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new NextResponse('No file provided', { status: 400 });
    }

    // Validate file size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      return new NextResponse('File too large. Maximum size is 20MB', { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'text/markdown',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
    ];

    if (!allowedTypes.includes(file.type)) {
      return new NextResponse('Invalid file type. Allowed: PDF, TXT, MD, DOC, DOCX, images', { status: 400 });
    }

    // Upload file to OpenAI
    const openaiFile = await openai.files.create({
      file: file,
      purpose: 'assistants',
    });

    // Create or update vector store
    let vectorStoreId = bot.vectorStoreId;
    
    if (!vectorStoreId) {
      // vectorStores is at the top level of the client, not in beta
      const vectorStore = await (openai as any).vectorStores.create({
        name: `${bot.name} Knowledge Base`,
      });
      vectorStoreId = vectorStore.id;

      // Update bot with vector store ID
      await prisma.bot.update({
        where: { id: botId },
        data: { vectorStoreId },
      });

      // Update assistant to use vector store (vectorStoreId is guaranteed non-null here)
      await openai.beta.assistants.update(bot.openaiAssistantId, {
        tool_resources: {
          file_search: {
            vector_store_ids: [vectorStoreId as string],
          },
        },
      });
    }

    // Add file to vector store
    // vectorStores is at the top level of the client, not in beta
    await (openai as any).vectorStores.files.create(vectorStoreId, {
      file_id: openaiFile.id,
    });

    // Save file record in database
    const botFile = await prisma.botFile.create({
      data: {
        botId: bot.id,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        openaiFileId: openaiFile.id,
        uploadedBy: user.id,
      },
    });

    // Track "upload_file" challenge (fire and forget)
    fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/challenges/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'upload_file' }),
    }).catch(err => console.error('[CHALLENGE_TRACK_ERROR]', err));

    return NextResponse.json(botFile);
  } catch (error) {
    console.error('[FILE_UPLOAD_ERROR]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

// Get all files for a bot
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
        files: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!bot) {
      return new NextResponse('Bot not found', { status: 404 });
    }

    // Check if user owns the bot
    if (bot.creatorId !== user.id && bot.isSystemBot) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    return NextResponse.json(bot.files);
  } catch (error) {
    console.error('[GET_FILES_ERROR]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

// Delete a file
export async function DELETE(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get('fileId');

    if (!fileId) {
      return new NextResponse('File ID required', { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    const botFile = await prisma.botFile.findUnique({
      where: { id: fileId },
      include: {
        bot: true,
      },
    });

    if (!botFile) {
      return new NextResponse('File not found', { status: 404 });
    }

    // Check if user owns the bot
    if (botFile.bot.creatorId !== user.id) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Delete from OpenAI
    try {
      // Use del method for file deletion
      await (openai.files as any).del(botFile.openaiFileId);
    } catch (error) {
      console.error('Failed to delete file from OpenAI:', error);
      // Continue anyway - file might already be deleted
    }

    // Delete from database
    await prisma.botFile.delete({
      where: { id: fileId },
    });

    return new NextResponse('Deleted', { status: 200 });
  } catch (error) {
    console.error('[DELETE_FILE_ERROR]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}



