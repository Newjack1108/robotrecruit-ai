import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

function getUtcStartOfDay(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

const DEFAULT_PUZZLE_CONFIG = {
  version: 1,
  type: 'placeholder',
  boardSize: 5,
  seed: null,
  message: 'Daily puzzle coming soon',
};

export async function GET() {
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

    const today = getUtcStartOfDay();

    let puzzle = await prisma.dailyPuzzle.findUnique({
      where: { date: today },
    });

    if (!puzzle) {
      puzzle = await prisma.dailyPuzzle.create({
        data: {
          date: today,
          puzzleConfig: DEFAULT_PUZZLE_CONFIG,
        },
      });
    }

    const submission = await prisma.dailyPuzzleSubmission.findUnique({
      where: {
        userId_puzzleId: {
          userId: user.id,
          puzzleId: puzzle.id,
        },
      },
    });

    return NextResponse.json({
      puzzle: {
        id: puzzle.id,
        date: puzzle.date.toISOString(),
        config: puzzle.puzzleConfig,
        hasSolution: Boolean(puzzle.solution),
      },
      submission: submission
        ? {
            score: submission.score,
            moves: submission.moves ?? null,
            durationSeconds: submission.durationSeconds ?? null,
            completedAt: submission.completedAt.toISOString(),
          }
        : null,
    });
  } catch (error) {
    console.error('[DAILY_PUZZLE_GET_ERROR]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

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
    const { puzzleId, score = 0, moves, durationSeconds } = body ?? {};

    if (!puzzleId || typeof puzzleId !== 'string') {
      return NextResponse.json({ error: 'Puzzle ID is required' }, { status: 400 });
    }

    const puzzle = await prisma.dailyPuzzle.findUnique({
      where: { id: puzzleId },
    });

    if (!puzzle) {
      return NextResponse.json({ error: 'Puzzle not found' }, { status: 404 });
    }

    const submission = await prisma.dailyPuzzleSubmission.upsert({
      where: {
        userId_puzzleId: {
          userId: user.id,
          puzzleId: puzzle.id,
        },
      },
      update: {
        score: typeof score === 'number' ? score : 0,
        moves: typeof moves === 'number' ? moves : null,
        durationSeconds: typeof durationSeconds === 'number' ? durationSeconds : null,
        completedAt: new Date(),
      },
      create: {
        userId: user.id,
        puzzleId: puzzle.id,
        score: typeof score === 'number' ? score : 0,
        moves: typeof moves === 'number' ? moves : null,
        durationSeconds: typeof durationSeconds === 'number' ? durationSeconds : null,
      },
    });

    return NextResponse.json({
      submission: {
        score: submission.score,
        moves: submission.moves ?? null,
        durationSeconds: submission.durationSeconds ?? null,
        completedAt: submission.completedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('[DAILY_PUZZLE_POST_ERROR]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

