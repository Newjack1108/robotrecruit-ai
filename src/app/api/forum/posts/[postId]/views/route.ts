import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// POST increment view count
export async function POST(
  req: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { postId } = await params;

    // Increment view count
    await prisma.forumPost.update({
      where: { id: postId },
      data: {
        views: {
          increment: 1,
        },
      },
    });

    return new NextResponse('View counted', { status: 200 });
  } catch (error: any) {
    console.error('[FORUM_POST_VIEW]', error);
    return new NextResponse(error.message || 'Internal Error', { status: 500 });
  }
}

