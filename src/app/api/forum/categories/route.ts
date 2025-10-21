import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET all categories with post counts
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const categories = await prisma.forumCategory.findMany({
      orderBy: {
        order: 'asc',
      },
      include: {
        _count: {
          select: {
            posts: true,
          },
        },
      },
    });

    return NextResponse.json(categories);
  } catch (error: any) {
    console.error('[FORUM_CATEGORIES_GET]', error);
    return new NextResponse(error.message || 'Internal Error', { status: 500 });
  }
}

