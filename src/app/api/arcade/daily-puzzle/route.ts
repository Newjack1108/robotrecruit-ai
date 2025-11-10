import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import {
  generateDailyStrategyPuzzle,
  computeOptimalSets,
  DailyStrategyPuzzleConfig,
  DailyStrategyPuzzleSolution,
} from '@/lib/arcade/dailyPuzzleGenerator';

function getUtcStartOfDay(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

const PUZZLE_POINT_REWARD = 25;
const PUZZLE_POWERUP_REWARD = 1;
const STREAK_REWARDS: Record<number, number> = {
  3: 50,
  7: 100,
  14: 250,
  30: 500,
  100: 1000,
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
      const { config, solution } = generateDailyStrategyPuzzle(today);
      puzzle = await prisma.dailyPuzzle.create({
        data: {
          date: today,
          puzzleConfig: config,
          solution,
        },
      });
    } else if (!puzzle.solution) {
      const config = puzzle.puzzleConfig as DailyStrategyPuzzleConfig | null;
      if (config) {
        const solution = computeOptimalSets(config);
        puzzle = await prisma.dailyPuzzle.update({
          where: { id: puzzle.id },
          data: { solution },
        });
      }
    }

    const config = puzzle.puzzleConfig as DailyStrategyPuzzleConfig;
    const solution = (puzzle.solution as DailyStrategyPuzzleSolution | null) ?? computeOptimalSets(config);

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
        config,
        optimalReward: solution.optimalReward,
      },
      submission: submission
        ? {
            score: submission.score,
            moves: submission.moves ?? null,
            durationSeconds: submission.durationSeconds ?? null,
            isCorrect: submission.isCorrect,
            submittedAnswer: submission.submittedAnswer,
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
    const { puzzleId, selectedTaskIds, durationSeconds } = body ?? {};

    if (!puzzleId || typeof puzzleId !== 'string') {
      return NextResponse.json({ error: 'Puzzle ID is required' }, { status: 400 });
    }

    if (!Array.isArray(selectedTaskIds)) {
      return NextResponse.json({ error: 'selectedTaskIds must be an array' }, { status: 400 });
    }

    const puzzle = await prisma.dailyPuzzle.findUnique({
      where: { id: puzzleId },
    });

    if (!puzzle) {
      return NextResponse.json({ error: 'Puzzle not found' }, { status: 404 });
    }

    const config = puzzle.puzzleConfig as DailyStrategyPuzzleConfig | null;

    if (!config) {
      return NextResponse.json({ error: 'Puzzle configuration missing' }, { status: 500 });
    }

    const solution = (puzzle.solution as DailyStrategyPuzzleSolution | null) ?? computeOptimalSets(config);

    const tasksById = new Map(config.tasks.map((task) => [task.id, task] as const));
    const uniqueSelection = Array.from(new Set(selectedTaskIds)).filter((id) => tasksById.has(id));

    if (uniqueSelection.length === 0) {
      return NextResponse.json({ error: 'Select at least one valid task' }, { status: 400 });
    }

    const selectedTasks = uniqueSelection.map((id) => tasksById.get(id)!);
    const totalTime = selectedTasks.reduce((acc, task) => acc + task.timeCost, 0);
    const totalReward = selectedTasks.reduce((acc, task) => acc + task.reward, 0);

    if (totalTime > config.timeBudget) {
      return NextResponse.json(
        {
          error: 'Time budget exceeded',
          totalTime,
          timeBudget: config.timeBudget,
        },
        { status: 400 },
      );
    }

    const optimalReward = solution.optimalReward;
    const efficiency = optimalReward > 0 ? Math.round((totalReward / optimalReward) * 100) : 100;
    const isOptimal = totalReward === optimalReward;

    const existingSubmission = await prisma.dailyPuzzleSubmission.findUnique({
      where: {
        userId_puzzleId: {
          userId: user.id,
          puzzleId: puzzle.id,
        },
      },
    });

    const submission = await prisma.dailyPuzzleSubmission.upsert({
      where: {
        userId_puzzleId: {
          userId: user.id,
          puzzleId: puzzle.id,
        },
      },
      update: {
        score: totalReward,
        moves: selectedTasks.length,
        durationSeconds: typeof durationSeconds === 'number' && durationSeconds >= 0 ? durationSeconds : null,
        submittedAnswer: {
          selectedTaskIds: uniqueSelection,
          totalTime,
          totalReward,
          efficiency,
        },
        isCorrect: isOptimal,
        completedAt: new Date(),
      },
      create: {
        userId: user.id,
        puzzleId: puzzle.id,
        score: totalReward,
        moves: selectedTasks.length,
        durationSeconds: typeof durationSeconds === 'number' && durationSeconds >= 0 ? durationSeconds : null,
        submittedAnswer: {
          selectedTaskIds: uniqueSelection,
          totalTime,
          totalReward,
          efficiency,
        },
        isCorrect: isOptimal,
      },
    });

    const shouldAwardRewards = !existingSubmission;

    const now = new Date();
    const todayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDayLocal = new Date(todayLocal);
    endOfDayLocal.setHours(23, 59, 59, 999);

    let rewardsSummary: {
      pointsAwarded: number;
      powerUpCreditsAwarded: number;
      streak?: {
        updated: boolean;
        currentStreak: number;
        longestStreak: number;
        milestoneReached: number | null;
        milestoneBonus: number;
        totalCheckIns: number;
      };
    } | null = null;

    if (shouldAwardRewards) {
      const lastCheckIn = user.lastCheckIn ? new Date(user.lastCheckIn) : null;
      const lastCheckInDay = lastCheckIn
        ? new Date(lastCheckIn.getFullYear(), lastCheckIn.getMonth(), lastCheckIn.getDate())
        : null;
      const yesterdayLocal = new Date(todayLocal);
      yesterdayLocal.setDate(yesterdayLocal.getDate() - 1);

      const hasCheckedInToday = lastCheckInDay
        ? lastCheckInDay.getTime() === todayLocal.getTime()
        : false;

      let newCurrentStreak = user.currentStreak ?? 0;
      let newLongestStreak = user.longestStreak ?? 0;
      let newTotalCheckIns = user.totalCheckIns ?? 0;
      let streakUpdated = false;

      if (!hasCheckedInToday) {
        if (lastCheckInDay && lastCheckInDay.getTime() === yesterdayLocal.getTime()) {
          newCurrentStreak = (user.currentStreak ?? 0) + 1;
        } else {
          newCurrentStreak = 1;
        }
        streakUpdated = true;
        newTotalCheckIns += 1;
        newLongestStreak = Math.max(newLongestStreak, newCurrentStreak);
      }

      let milestoneBonus = 0;
      let milestoneReached: number | null = null;
      if (streakUpdated && STREAK_REWARDS[newCurrentStreak]) {
        milestoneBonus = STREAK_REWARDS[newCurrentStreak];
        milestoneReached = newCurrentStreak;
      }

      const totalPointsAwarded = PUZZLE_POINT_REWARD + milestoneBonus;

      const userUpdateData: Prisma.UserUpdateInput = {
        powerUpAllowance: { increment: PUZZLE_POWERUP_REWARD },
        streakPoints: { increment: totalPointsAwarded },
      };

      if (streakUpdated) {
        userUpdateData.currentStreak = newCurrentStreak;
        userUpdateData.longestStreak = newLongestStreak;
        userUpdateData.lastCheckIn = now;
        userUpdateData.totalCheckIns = newTotalCheckIns;
      }

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: userUpdateData,
      });

      rewardsSummary = {
        pointsAwarded: totalPointsAwarded,
        powerUpCreditsAwarded: PUZZLE_POWERUP_REWARD,
        streak: {
          updated: streakUpdated,
          currentStreak: updatedUser.currentStreak,
          longestStreak: updatedUser.longestStreak,
          milestoneReached,
          milestoneBonus,
          totalCheckIns: updatedUser.totalCheckIns,
        },
      };

      await prisma.gameScore.create({
        data: {
          userId: user.id,
          gameType: 'daily_strategy_puzzle',
          score: totalReward,
          moves: selectedTasks.length,
          timeSeconds: typeof durationSeconds === 'number' ? durationSeconds : totalTime,
          difficulty: 'normal',
          metadata: {
            puzzleId,
            selectedTaskIds: uniqueSelection,
            totalReward,
            totalTime,
            efficiency,
            optimalReward,
          },
        },
      });

      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'daily_puzzle_complete',
          title: '🧩 Daily Puzzle Complete',
          message: `You earned ${totalPointsAwarded} points and ${PUZZLE_POWERUP_REWARD} power-up credit for completing today’s puzzle.`,
          link: '/arcade/daily-puzzle',
          isRead: false,
          metadata: {
            puzzleId,
            efficiency,
            totalReward,
            totalTime,
            milestoneReached,
          },
        },
      });

      if (rewardsSummary.streak?.milestoneReached) {
        await prisma.notification.create({
          data: {
            userId: user.id,
            type: 'streak_milestone',
            title: `🔥 ${rewardsSummary.streak.milestoneReached} Day Streak!`,
            message: `Your puzzle streak hit ${rewardsSummary.streak.milestoneReached} days. Bonus ${milestoneBonus} points awarded!`,
            link: '/dashboard',
            isRead: false,
            metadata: {
              milestone: rewardsSummary.streak.milestoneReached,
              bonus: milestoneBonus,
            },
          },
        });
      }
    }

    let challengeSummary: {
      title: string;
      pointsEarned: number;
    } | null = null;

    const dayOfWeek = now.getDay();
    const todaysChallenges = await prisma.dailyChallenge.findMany({
      where: {
        dayOfWeek,
        isActive: true,
      },
    });

    const puzzleChallenge = todaysChallenges.find((challenge) => {
      const requirement = challenge.requirement as { type?: string } | null;
      return requirement?.type === 'daily_puzzle';
    });

    if (puzzleChallenge) {
      const existingCompletion = await prisma.userChallengeCompletion.findFirst({
        where: {
          userId: user.id,
          challengeId: puzzleChallenge.id,
          completedAt: {
            gte: todayLocal,
            lte: endOfDayLocal,
          },
        },
      });

      if (!existingCompletion) {
        await prisma.userChallengeCompletion.create({
          data: {
            userId: user.id,
            challengeId: puzzleChallenge.id,
            progress: 1,
            isCompleted: true,
            pointsEarned: puzzleChallenge.points,
          },
        });

        challengeSummary = {
          title: puzzleChallenge.title,
          pointsEarned: puzzleChallenge.points,
        };

        await prisma.notification.create({
          data: {
            userId: user.id,
            type: 'daily_challenge_complete',
            title: `🏆 Challenge Complete: ${puzzleChallenge.title}`,
            message: `You earned ${puzzleChallenge.points} points for finishing today’s puzzle challenge.`,
            link: '/dashboard',
            isRead: false,
            metadata: {
              challengeKey: puzzleChallenge.key,
              pointsEarned: puzzleChallenge.points,
            },
          },
        });
      }
    }

    return NextResponse.json({
      submission: {
        score: submission.score,
        moves: submission.moves ?? null,
        durationSeconds: submission.durationSeconds ?? null,
        isCorrect: submission.isCorrect,
        efficiency,
        totalReward,
        totalTime,
        optimalReward,
        selectedTaskIds: uniqueSelection,
        completedAt: submission.completedAt.toISOString(),
        rewards: rewardsSummary,
        challenge: challengeSummary,
      },
    });
  } catch (error) {
    console.error('[DAILY_PUZZLE_POST_ERROR]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

