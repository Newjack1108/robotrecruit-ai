import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET a single post
export async function GET(
  req: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { postId } = await params;

    const post = await prisma.forumPost.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            tier: true,
          },
        },
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
        replies: {
          orderBy: {
            createdAt: 'asc',
          },
          include: {
            author: {
              select: {
                id: true,
                email: true,
                tier: true,
              },
            },
          },
        },
      },
    });

    if (!post) {
      return new NextResponse('Post not found', { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error: any) {
    console.error('[FORUM_POST_GET]', error);
    return new NextResponse(error.message || 'Internal Error', { status: 500 });
  }
}

// DELETE a post
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ postId: string }> }
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

    const { postId } = await params;

    const post = await prisma.forumPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return new NextResponse('Post not found', { status: 404 });
    }

    // Check if user is the author
    if (post.authorId !== user.id) {
      return new NextResponse('Forbidden: You can only delete your own posts', { status: 403 });
    }

    await prisma.forumPost.delete({
      where: { id: postId },
    });

    return new NextResponse('Post deleted successfully', { status: 200 });
  } catch (error: any) {
    console.error('[FORUM_POST_DELETE]', error);
    return new NextResponse(error.message || 'Internal Error', { status: 500 });
  }
}

