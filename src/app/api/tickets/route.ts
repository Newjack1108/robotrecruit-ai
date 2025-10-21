import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Create a new ticket
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

    const body = await req.json();
    const { subject, description, category, priority } = body;

    if (!subject || !description || !category) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const ticket = await prisma.ticket.create({
      data: {
        userId: user.id,
        subject,
        description,
        category,
        priority: priority || 'medium',
      },
    });

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('[CREATE_TICKET_ERROR]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

// Get user's tickets
export async function GET(req: Request) {
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

    const tickets = await prisma.ticket.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            responses: true,
          },
        },
      },
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error('[GET_TICKETS_ERROR]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}



