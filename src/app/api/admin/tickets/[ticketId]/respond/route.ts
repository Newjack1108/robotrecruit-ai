import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const { sessionClaims } = await auth();

    if (!sessionClaims || (sessionClaims.metadata as any)?.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { ticketId } = await params;
    const body = await req.json();
    const { content, newStatus } = body;

    if (!content) {
      return new NextResponse('Missing content', { status: 400 });
    }

    const adminEmail = sessionClaims.email as string;

    // Create response
    await prisma.ticketResponse.create({
      data: {
        ticketId,
        content,
        isStaff: true,
        authorEmail: adminEmail,
      },
    });

    // Update ticket status if provided
    if (newStatus) {
      await prisma.ticket.update({
        where: { id: ticketId },
        data: { status: newStatus },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[RESPOND_TICKET_ERROR]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}



