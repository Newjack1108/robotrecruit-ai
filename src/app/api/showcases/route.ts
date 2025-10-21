import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/showcases
 * Fetch all showcases with filters
 * Query params: category, userId, featured, limit, offset
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const userId = searchParams.get('userId');
    const featured = searchParams.get('featured') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {};
    if (category && category !== 'all') where.category = category;
    if (userId) where.userId = userId;
    if (featured) where.featured = true;

    const showcases = await (prisma as any).userShowcase.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            tier: true,
          },
        },
        relatedBot: {
          select: {
            id: true,
            name: true,
            slug: true,
            avatarUrl: true,
          },
        },
        kudos: {
          select: {
            userId: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });

    return NextResponse.json({ showcases });
  } catch (error) {
    console.error('[SHOWCASES_GET]', error);
    return NextResponse.json({ error: 'Failed to fetch showcases' }, { status: 500 });
  }
}

/**
 * POST /api/showcases
 * Create a new showcase
 */
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { title, description, imageUrl, category, relatedBotId } = body;

    // Validation
    if (!title || !description || !imageUrl || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, imageUrl, category' },
        { status: 400 }
      );
    }

    if (title.length > 100) {
      return NextResponse.json({ error: 'Title too long (max 100 characters)' }, { status: 400 });
    }

    if (description.length > 1000) {
      return NextResponse.json({ error: 'Description too long (max 1000 characters)' }, { status: 400 });
    }

    const validCategories = ['fishing', 'beekeeping', 'cooking', 'fitness', 'garden', 'diy', 'sport', 'art', 'other'];
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    // Create showcase
    const showcase = await (prisma as any).userShowcase.create({
      data: {
        userId: user.id,
        title,
        description,
        imageUrl,
        category,
        relatedBotId: relatedBotId || null,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            tier: true,
          },
        },
        relatedBot: {
          select: {
            id: true,
            name: true,
            slug: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Check for "first showcase" achievement
    const showcaseCount = await (prisma as any).userShowcase.count({
      where: { userId: user.id },
    });

    if (showcaseCount === 1) {
      // Award "First Showcase" achievement
      const { checkAchievements } = await import('@/lib/achievement-checker');
      await checkAchievements(user.id);
    }

    return NextResponse.json({ showcase }, { status: 201 });
  } catch (error) {
    console.error('[SHOWCASES_POST]', error);
    return NextResponse.json({ error: 'Failed to create showcase' }, { status: 500 });
  }
}

