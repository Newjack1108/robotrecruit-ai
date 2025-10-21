import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - Fetch user's reminders
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(req.url);
    const showCompleted = searchParams.get('showCompleted') === 'true';

    const reminders = await prisma.reminder.findMany({
      where: {
        userId: user.id,
        ...(showCompleted ? {} : { isCompleted: false }),
      },
      orderBy: {
        reminderTime: 'asc',
      },
    });

    return NextResponse.json(reminders);

  } catch (error) {
    console.error('[REMINDERS_GET_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to fetch reminders' },
      { status: 500 }
    );
  }
}

// POST - Create a new reminder
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { botId, conversationId, title, description, reminderTime } = await req.json();

    if (!title || !reminderTime) {
      return NextResponse.json(
        { error: 'Title and reminder time are required' },
        { status: 400 }
      );
    }

    const reminder = await prisma.reminder.create({
      data: {
        userId: user.id,
        botId,
        conversationId,
        title,
        description,
        reminderTime: new Date(reminderTime),
      },
    });

    return NextResponse.json(reminder);

  } catch (error) {
    console.error('[REMINDERS_POST_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to create reminder' },
      { status: 500 }
    );
  }
}

// PATCH - Update reminder (mark as completed)
export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { reminderId, isCompleted } = await req.json();

    const reminder = await prisma.reminder.update({
      where: {
        id: reminderId,
        userId: user.id, // Ensure user owns this reminder
      },
      data: {
        isCompleted,
      },
    });

    return NextResponse.json(reminder);

  } catch (error) {
    console.error('[REMINDERS_PATCH_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to update reminder' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a reminder
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { reminderId } = await req.json();

    await prisma.reminder.delete({
      where: {
        id: reminderId,
        userId: user.id, // Ensure user owns this reminder
      },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[REMINDERS_DELETE_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to delete reminder' },
      { status: 500 }
    );
  }
}

