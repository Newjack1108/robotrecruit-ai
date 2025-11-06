import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET: Retrieve user's saved CV profiles
export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const profileId = searchParams.get('id');

    if (profileId) {
      // Get specific profile
      // @ts-expect-error - Prisma type needs refresh
      const profile = await prisma.cvProfile.findFirst({
        where: {
          id: profileId,
          userId: user.id,
        },
      });

      if (!profile) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
      }

      return NextResponse.json(profile);
    }

    // Get all profiles for user
    // @ts-expect-error - Prisma type needs refresh
    const profiles = await prisma.cvProfile.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(profiles);
  } catch (error) {
    console.error('[CV_PROFILE_GET_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Save a new CV profile
export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const { name, data } = body;

    if (!name || !data) {
      return NextResponse.json({ error: 'Name and data are required' }, { status: 400 });
    }

    // @ts-expect-error - Prisma type needs refresh
    const profile = await prisma.cvProfile.create({
      data: {
        userId: user.id,
        name: name.trim(),
        data,
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error('[CV_PROFILE_POST_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT: Update existing profile
export async function PUT(req: NextRequest) {
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

    const body = await req.json();
    const { id, name, data } = body;

    if (!id) {
      return NextResponse.json({ error: 'Profile ID is required' }, { status: 400 });
    }

    // Verify profile belongs to user
    // @ts-expect-error - Prisma type needs refresh
    const existingProfile = await prisma.cvProfile.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingProfile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Update profile
    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (data !== undefined) updateData.data = data;

    // @ts-expect-error - Prisma type needs refresh
    const profile = await prisma.cvProfile.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error('[CV_PROFILE_PUT_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Delete a profile
export async function DELETE(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const profileId = searchParams.get('id');

    if (!profileId) {
      return NextResponse.json({ error: 'Profile ID is required' }, { status: 400 });
    }

    // Verify profile belongs to user
    // @ts-expect-error - Prisma type needs refresh
    const existingProfile = await prisma.cvProfile.findFirst({
      where: {
        id: profileId,
        userId: user.id,
      },
    });

    if (!existingProfile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // @ts-expect-error - Prisma type needs refresh
    await prisma.cvProfile.delete({
      where: { id: profileId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[CV_PROFILE_DELETE_ERROR]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

