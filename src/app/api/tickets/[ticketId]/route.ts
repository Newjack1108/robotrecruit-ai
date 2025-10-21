import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ ticketId: string }> }
) {
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

    const { ticketId } = await params;

    const ticket = await prisma.ticket.findFirst({
      where: {
        id: ticketId,
        userId: user.id,
      },
      include: {
        responses: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!ticket) {
      return new NextResponse('Ticket not found', { status: 404 });
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('[GET_TICKET_ERROR]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

// User adds a response to their own ticket
export async function POST(
  req: Request,
  { params }: { params: Promise<{ ticketId: string }> }
) {
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

    const { ticketId } = await params;
    const body = await req.json();
    const { content } = body;

    if (!content) {
      return new NextResponse('Missing content', { status: 400 });
    }

    // Verify ticket belongs to user
    const ticket = await prisma.ticket.findFirst({
      where: {
        id: ticketId,
        userId: user.id,
      },
    });

    if (!ticket) {
      return new NextResponse('Ticket not found', { status: 404 });
    }

    // Create response
    const response = await prisma.ticketResponse.create({
      data: {
        ticketId,
        content,
        isStaff: false,
        authorEmail: user.email,
      },
    });

    // Update ticket to in-progress if it was resolved
    if (ticket.status === 'resolved' || ticket.status === 'closed') {
      await prisma.ticket.update({
        where: { id: ticketId },
        data: { status: 'in-progress' },
      });
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('[RESPOND_TICKET_ERROR]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}



