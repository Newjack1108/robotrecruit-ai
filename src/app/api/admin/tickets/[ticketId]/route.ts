import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const { sessionClaims } = await auth();

    if (!sessionClaims || (sessionClaims.metadata as any)?.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { ticketId } = await params;

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        user: {
          select: {
            email: true,
            tier: true,
          },
        },
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



