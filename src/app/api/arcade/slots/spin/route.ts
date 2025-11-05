import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
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

    const { result, sessionTotal } = await req.json();

    if (!result || !Array.isArray(result) || result.length !== 3) {
      return NextResponse.json({ error: 'Invalid spin result' }, { status: 400 });
    }

    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find today's spin record
    const dailySpins = await prisma.dailySlotSpins.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date: today,
        },
      },
    });

    if (!dailySpins || dailySpins.spinsUsed >= dailySpins.spinsTotal) {
      return NextResponse.json({ error: 'No spins left today' }, { status: 400 });
    }

    // Calculate winnings
    let pointsWon = 10; // Consolation prize
    let creditsWon = 0;
    let winType = 'small';

    // Check for three of a kind (jackpot!)
    if (result[0] === result[1] && result[1] === result[2]) {
      pointsWon = 1000;
      creditsWon = 3; // 3 credits for jackpot
      winType = 'jackpot';
    } 
    // Check for two matching
    else if (
      result[0] === result[1] ||
      result[1] === result[2] ||
      result[0] === result[2]
    ) {
      pointsWon = 100;
      creditsWon = 1; // 1 credit for matching 2
      winType = 'match';
    }

    // Update spins used
    await prisma.dailySlotSpins.update({
      where: {
        userId_date: {
          userId: user.id,
          date: today,
        },
      },
      data: {
        spinsUsed: dailySpins.spinsUsed + 1,
      },
    });

    // Record spin history
    await prisma.slotSpinHistory.create({
      data: {
        userId: user.id,
        result,
        pointsWon,
        creditsWon,
      },
    });

    // Award credits if won
    if (creditsWon > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          powerUpAllowance: {
            increment: creditsWon,
          },
        },
      });
    }

    const spinsLeft = dailySpins.spinsTotal - (dailySpins.spinsUsed + 1);
    const isLastSpin = spinsLeft === 0;

    // Submit to arcade scores for leaderboard ONLY on the last spin with cumulative total
    if (isLastSpin && sessionTotal !== undefined) {
      await prisma.gameScore.create({
        data: {
          userId: user.id,
          gameType: 'bot_slots',
          score: sessionTotal + pointsWon, // Cumulative total for the session
          moves: dailySpins.spinsTotal, // Total spins (10)
          timeSeconds: 0, // Not time-based
          difficulty: 'normal',
          metadata: {
            finalResult: result,
            finalCreditsWon: creditsWon,
            finalWinType: winType,
          },
        },
      });
    }

    return NextResponse.json({
      pointsWon,
      creditsWon,
      winType,
      spinsLeft,
      isLastSpin,
    });
  } catch (error) {
    console.error('[SLOTS_SPIN_ERROR]', error);
    return NextResponse.json({ error: 'Failed to process spin' }, { status: 500 });
  }
}

