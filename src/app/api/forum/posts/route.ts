import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { checkAchievements } from '@/lib/achievement-checker';

// GET posts (with optional category filter)
export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get('category');
    const sortBy = searchParams.get('sortBy') || 'recent';

    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === 'views') {
      orderBy = { views: 'desc' };
    } else if (sortBy === 'replies') {
      orderBy = { replies: { _count: 'desc' } };
    }

    const where: any = {};
    if (categorySlug) {
      const category = await prisma.forumCategory.findUnique({
        where: { slug: categorySlug },
      });
      if (category) {
        where.categoryId = category.id;
      }
    }

    const posts = await prisma.forumPost.findMany({
      where,
      orderBy,
      include: {
        author: {
          select: {
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
        _count: {
          select: {
            replies: true,
          },
        },
      },
    });

    return NextResponse.json(posts);
  } catch (error: any) {
    console.error('[FORUM_POSTS_GET]', error);
    return new NextResponse(error.message || 'Internal Error', { status: 500 });
  }
}

// POST create a new post
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
    const { title, content, categorySlug } = body;

    if (!title || !content || !categorySlug) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Validate lengths
    if (title.length > 200) {
      return new NextResponse('Title too long (max 200 characters)', { status: 400 });
    }
    if (content.length > 5000) {
      return new NextResponse('Content too long (max 5000 characters)', { status: 400 });
    }

    // Find category
    const category = await prisma.forumCategory.findUnique({
      where: { slug: categorySlug },
    });

    if (!category) {
      return new NextResponse('Category not found', { status: 404 });
    }

    // Create post
    const post = await prisma.forumPost.create({
      data: {
        title,
        content,
        authorId: user.id,
        categoryId: category.id,
      },
      include: {
        author: {
          select: {
            email: true,
          },
        },
        category: {
          select: {
            slug: true,
          },
        },
      },
    });

    // Check for achievement unlocks (don't wait for it)
    checkAchievements(user.id).catch(err => 
      console.error('[ACHIEVEMENT_CHECK_ERROR]', err)
    );

    // Track "forum_activity" challenge (fire and forget)
    fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/challenges/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'forum_activity' }),
    }).catch(err => console.error('[CHALLENGE_TRACK_ERROR]', err));

    return NextResponse.json(post);
  } catch (error: any) {
    console.error('[FORUM_POST_CREATE]', error);
    return new NextResponse(error.message || 'Internal Error', { status: 500 });
  }
}

