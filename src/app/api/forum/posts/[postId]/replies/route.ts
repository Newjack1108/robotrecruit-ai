import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { notifyForumReply } from '@/lib/notifications';

// POST create a reply
export async function POST(
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
    const body = await req.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return new NextResponse('Content is required', { status: 400 });
    }

    // Validate length
    if (content.length > 2000) {
      return new NextResponse('Reply too long (max 2000 characters)', { status: 400 });
    }

    // Check if post exists (with category for notification)
    const post = await prisma.forumPost.findUnique({
      where: { id: postId },
      include: {
        category: {
          select: {
            slug: true,
          },
        },
      },
    });

    if (!post) {
      return new NextResponse('Post not found', { status: 404 });
    }

    // Check if post is locked
    if (post.isLocked) {
      return new NextResponse('This post is locked and cannot accept new replies', { status: 403 });
    }

    // Create reply
    const reply = await prisma.forumReply.create({
      data: {
        content: content.trim(),
        authorId: user.id,
        postId,
      },
      include: {
        author: {
          select: {
            email: true,
            tier: true,
          },
        },
      },
    });

    // Send notification to post author (async, don't wait)
    notifyForumReply({
      postAuthorId: post.authorId,
      replyAuthorId: user.id,
      postTitle: post.title,
      postId: post.id,
      categorySlug: post.category.slug,
      replyId: reply.id,
    }).catch(error => {
      console.error('[NOTIFY_FORUM_REPLY_ERROR]', error);
    });

    return NextResponse.json(reply);
  } catch (error: any) {
    console.error('[FORUM_REPLY_CREATE]', error);
    return new NextResponse(error.message || 'Internal Error', { status: 500 });
  }
}

