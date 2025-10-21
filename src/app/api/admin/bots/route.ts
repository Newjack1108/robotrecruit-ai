import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

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

    const updatedBot = await prisma.bot.update({
      where: { id: botId },
      data: updateData,
    });

    return NextResponse.json(updatedBot);
  } catch (error) {
    console.error('[ADMIN_BOT_UPDATE_ERROR]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

