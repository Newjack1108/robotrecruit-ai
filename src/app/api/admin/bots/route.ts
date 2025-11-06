import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function PATCH(req: Request) {
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

    // Check if user is admin
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    const isAdmin = adminEmails.includes(user.email);

    if (!isAdmin) {
      return new NextResponse('Forbidden: Admin access required', { status: 403 });
    }

    const body = await req.json();
    const { 
      botId, 
      openaiAssistantId, 
      imageRecognition,
      voiceResponse,
      fileUpload,
      webSearch,
      scheduling,
      dataExport
    } = body;

    if (!botId || !openaiAssistantId) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Validate assistant ID format
    if (!openaiAssistantId.startsWith('asst_')) {
      return new NextResponse('Invalid assistant ID format. Must start with "asst_"', { status: 400 });
    }

    const updateData: any = { openaiAssistantId };
    
    // Update power-ups if provided
    if (typeof imageRecognition === 'boolean') updateData.imageRecognition = imageRecognition;
    if (typeof voiceResponse === 'boolean') updateData.voiceResponse = voiceResponse;
    if (typeof fileUpload === 'boolean') updateData.fileUpload = fileUpload;
    if (typeof webSearch === 'boolean') updateData.webSearch = webSearch;
    if (typeof scheduling === 'boolean') updateData.scheduling = scheduling;
    if (typeof dataExport === 'boolean') updateData.dataExport = dataExport;

    // Check if assistant ID is already in use by another bot
    const existingBot = await prisma.bot.findUnique({
      where: { openaiAssistantId },
    });

    if (existingBot && existingBot.id !== botId) {
      return new NextResponse(
        `This assistant ID is already in use by bot: ${existingBot.name}`,
        { status: 409 }
      );
    }

    const updatedBot = await prisma.bot.update({
      where: { id: botId },
      data: updateData,
    });

    return NextResponse.json(updatedBot);
  } catch (error) {
    // Enhanced error logging
    console.error('[ADMIN_BOT_UPDATE_ERROR] Full error:', error);
    console.error('[ADMIN_BOT_UPDATE_ERROR] Error type:', typeof error);
    
    if (error instanceof Error) {
      console.error('[ADMIN_BOT_UPDATE_ERROR] Error message:', error.message);
      console.error('[ADMIN_BOT_UPDATE_ERROR] Error stack:', error.stack);
    } else {
      console.error('[ADMIN_BOT_UPDATE_ERROR] Error object:', JSON.stringify(error, null, 2));
    }

    // Check for Prisma unique constraint violation
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Check if it's a Prisma known request error
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // P2002 is unique constraint violation
      if (error.code === 'P2002') {
        const target = (error.meta?.target as string[]) || [];
        if (target.includes('openaiAssistantId')) {
          return new NextResponse(
            'This assistant ID is already in use by another bot. Please use a different ID.',
            { status: 409 }
          );
        }
        return new NextResponse(
          `Unique constraint violation on field: ${target.join(', ')}`,
          { status: 409 }
        );
      }
      
      // P2025 is record not found
      if (error.code === 'P2025') {
        return new NextResponse('Bot not found', { status: 404 });
      }
    }
    
    // Fallback checks for error messages
    if (errorMessage.includes('Unique constraint') || errorMessage.includes('unique constraint')) {
      return new NextResponse(
        'This assistant ID is already in use by another bot. Please use a different ID.',
        { status: 409 }
      );
    }

    // Check for Prisma record not found
    if (errorMessage.includes('Record to update does not exist') || errorMessage.includes('not found')) {
      return new NextResponse('Bot not found', { status: 404 });
    }

    return new NextResponse(
      `Internal Error: ${errorMessage}`,
      { status: 500 }
    );
  }
}

