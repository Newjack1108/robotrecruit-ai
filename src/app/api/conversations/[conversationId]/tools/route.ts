import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET: Retrieve all tool data for a conversation
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { conversationId } = await params;

    // Verify the conversation belongs to the user
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { user: true },
    });

    if (!conversation || conversation.user.clerkId !== userId) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Get all tool data for this conversation
    // @ts-expect-error - Prisma type needs refresh
    const toolData = await prisma.botToolData.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(toolData);
  } catch (error) {
    console.error('Error fetching tool data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create new tool data entry
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { conversationId } = await params;
    const body = await req.json();
    const { toolType, data, isActive } = body;

    // Verify the conversation belongs to the user
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { user: true },
    });

    if (!conversation || conversation.user.clerkId !== userId) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Create new tool data
    // @ts-expect-error - Prisma type needs refresh
    const toolData = await prisma.botToolData.create({
      data: {
        conversationId,
        toolType,
        data,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(toolData);
  } catch (error) {
    console.error('Error creating tool data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT: Update existing tool data
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { conversationId } = await params;
    const body = await req.json();
    const { id, toolType, data, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: 'Tool data ID required' }, { status: 400 });
    }

    // Verify the conversation belongs to the user
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { user: true },
    });

    if (!conversation || conversation.user.clerkId !== userId) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Update tool data
    // @ts-expect-error - Prisma type needs refresh
    const toolData = await prisma.botToolData.update({
      where: { id },
      data: {
        ...(toolType && { toolType }),
        ...(data && { data }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json(toolData);
  } catch (error) {
    console.error('Error updating tool data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Remove tool data
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { conversationId } = await params;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Tool data ID required' }, { status: 400 });
    }

    // Verify the conversation belongs to the user
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { user: true },
    });

    if (!conversation || conversation.user.clerkId !== userId) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Delete tool data
    // @ts-expect-error - Prisma type needs refresh
    await prisma.botToolData.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting tool data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

