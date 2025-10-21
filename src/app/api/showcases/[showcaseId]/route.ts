import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/showcases/[showcaseId]
 * Get a single showcase
 */
export async function GET(
  request: Request,
  { params }: { params: { showcaseId: string } }
) {
  try {
    const { showcaseId } = params;

    const showcase = await (prisma as any).userShowcase.findUnique({
      where: { id: showcaseId },
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
          include: {
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!showcase) {
      return NextResponse.json({ error: 'Showcase not found' }, { status: 404 });
    }

    return NextResponse.json({ showcase });
  } catch (error) {
    console.error('[SHOWCASE_GET]', error);
    return NextResponse.json({ error: 'Failed to fetch showcase' }, { status: 500 });
  }
}

/**
 * DELETE /api/showcases/[showcaseId]
 * Delete a showcase (only owner can delete)
 */
export async function DELETE(
  request: Request,
  { params }: { params: { showcaseId: string } }
) {
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

    const { showcaseId } = params;

    const showcase = await (prisma as any).userShowcase.findUnique({
      where: { id: showcaseId },
    });

    if (!showcase) {
      return NextResponse.json({ error: 'Showcase not found' }, { status: 404 });
    }

    // Check ownership
    if (showcase.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden: You can only delete your own showcases' }, { status: 403 });
    }

    await (prisma as any).userShowcase.delete({
      where: { id: showcaseId },
    });

    return NextResponse.json({ success: true, message: 'Showcase deleted' });
  } catch (error) {
    console.error('[SHOWCASE_DELETE]', error);
    return NextResponse.json({ error: 'Failed to delete showcase' }, { status: 500 });
  }
}

/**
 * PATCH /api/showcases/[showcaseId]
 * Update a showcase (only owner can update)
 */
export async function PATCH(
  request: Request,
  { params }: { params: { showcaseId: string } }
) {
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

    const { showcaseId } = params;

    const showcase = await (prisma as any).userShowcase.findUnique({
      where: { id: showcaseId },
    });

    if (!showcase) {
      return NextResponse.json({ error: 'Showcase not found' }, { status: 404 });
    }

    // Check ownership
    if (showcase.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden: You can only update your own showcases' }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, category, relatedBotId } = body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (relatedBotId !== undefined) updateData.relatedBotId = relatedBotId;

    const updated = await (prisma as any).userShowcase.update({
      where: { id: showcaseId },
      data: updateData,
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

    return NextResponse.json({ showcase: updated });
  } catch (error) {
    console.error('[SHOWCASE_PATCH]', error);
    return NextResponse.json({ error: 'Failed to update showcase' }, { status: 500 });
  }
}

