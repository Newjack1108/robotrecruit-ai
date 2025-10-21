import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * POST /api/showcases/[showcaseId]/kudos
 * Give kudos to a showcase (like/react)
 */
export async function POST(
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

    // Check if showcase exists
    const showcase = await (prisma as any).userShowcase.findUnique({
      where: { id: showcaseId },
    });

    if (!showcase) {
      return NextResponse.json({ error: 'Showcase not found' }, { status: 404 });
    }

    // Check if user already gave kudos
    const existingKudos = await (prisma as any).showcaseKudos.findUnique({
      where: {
        showcaseId_userId: {
          showcaseId,
          userId: user.id,
        },
      },
    });

    if (existingKudos) {
      return NextResponse.json({ error: 'You already gave kudos to this showcase' }, { status: 400 });
    }

    // Create kudos
    await (prisma as any).showcaseKudos.create({
      data: {
        showcaseId,
        userId: user.id,
      },
    });

    // Increment kudos count
    const updated = await (prisma as any).userShowcase.update({
      where: { id: showcaseId },
      data: {
        kudosCount: {
          increment: 1,
        },
      },
    });

    // Check for kudos-related achievements for the showcase owner
    if (updated.kudosCount === 10 || updated.kudosCount === 100) {
      const { checkAchievements } = await import('@/lib/achievement-checker');
      await checkAchievements(showcase.userId);
    }

    return NextResponse.json({ success: true, kudosCount: updated.kudosCount });
  } catch (error) {
    console.error('[SHOWCASE_KUDOS_POST]', error);
    return NextResponse.json({ error: 'Failed to give kudos' }, { status: 500 });
  }
}

/**
 * DELETE /api/showcases/[showcaseId]/kudos
 * Remove kudos from a showcase (unlike)
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

    // Check if kudos exists
    const existingKudos = await (prisma as any).showcaseKudos.findUnique({
      where: {
        showcaseId_userId: {
          showcaseId,
          userId: user.id,
        },
      },
    });

    if (!existingKudos) {
      return NextResponse.json({ error: 'You have not given kudos to this showcase' }, { status: 400 });
    }

    // Delete kudos
    await (prisma as any).showcaseKudos.delete({
      where: {
        showcaseId_userId: {
          showcaseId,
          userId: user.id,
        },
      },
    });

    // Decrement kudos count
    const updated = await (prisma as any).userShowcase.update({
      where: { id: showcaseId },
      data: {
        kudosCount: {
          decrement: 1,
        },
      },
    });

    return NextResponse.json({ success: true, kudosCount: updated.kudosCount });
  } catch (error) {
    console.error('[SHOWCASE_KUDOS_DELETE]', error);
    return NextResponse.json({ error: 'Failed to remove kudos' }, { status: 500 });
  }
}

