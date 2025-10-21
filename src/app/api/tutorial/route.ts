import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET tutorial progress
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        tutorialCompleted: true,
        tutorialStep: true,
      },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    return NextResponse.json({
      completed: user.tutorialCompleted,
      currentStep: user.tutorialStep,
    });
  } catch (error: any) {
    console.error('[TUTORIAL_GET]', error);
    return new NextResponse(error.message || 'Internal Error', { status: 500 });
  }
}

// PATCH update tutorial progress
export async function PATCH(req: Request) {
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
    const { step, completed } = body;

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(typeof step === 'number' && { tutorialStep: step }),
        ...(typeof completed === 'boolean' && { tutorialCompleted: completed }),
      },
      select: {
        tutorialCompleted: true,
        tutorialStep: true,
      },
    });

    return NextResponse.json({
      completed: updated.tutorialCompleted,
      currentStep: updated.tutorialStep,
    });
  } catch (error: any) {
    console.error('[TUTORIAL_PATCH]', error);
    return new NextResponse(error.message || 'Internal Error', { status: 500 });
  }
}

// POST skip tutorial
export async function POST() {
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

    await prisma.user.update({
      where: { id: user.id },
      data: {
        tutorialCompleted: true,
        tutorialStep: 0,
      },
    });

    return NextResponse.json({ message: 'Tutorial skipped' });
  } catch (error: any) {
    console.error('[TUTORIAL_SKIP]', error);
    return new NextResponse(error.message || 'Internal Error', { status: 500 });
  }
}

