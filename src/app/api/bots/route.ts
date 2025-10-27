import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export async function GET() {
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

    // Return system bots + user's own custom bots only
    const bots = await prisma.bot.findMany({
      where: {
        OR: [
          { isSystemBot: true },
          { creatorId: user.id }
        ]
      },
      orderBy: {
        tier: 'asc',
      },
    });

    return NextResponse.json(bots);
  } catch (error) {
    console.error('[GET_BOTS_ERROR]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}




