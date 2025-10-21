import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const bots = await prisma.bot.findMany({
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




