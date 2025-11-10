import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

// Wheel rewards configuration
const WHEEL_REWARDS = [
  { type: 'credits', value: 1, weight: 25, label: '1 Credit' },
  { type: 'credits', value: 3, weight: 20, label: '3 Credits' },
  { type: 'credits', value: 5, weight: 15, label: '5 Credits' },
  { type: 'credits', value: 10, weight: 8, label: '10 Credits!' },
  { type: 'points', value: 25, weight: 20, label: '25 Points' },
  { type: 'points', value: 50, weight: 15, label: '50 Points' },
  { type: 'points', value: 100, weight: 5, label: '100 Points!' },
  { type: 'freeze', value: 1, weight: 2, label: 'Streak Freeze!' },
];

function selectRandomReward() {
  const totalWeight = WHEEL_REWARDS.reduce((sum, r) => sum + r.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const reward of WHEEL_REWARDS) {
    random -= reward.weight;
    if (random <= 0) {
      return reward;
    }
  }
  
  return WHEEL_REWARDS[0]; // Fallback
}

/**
 * POST /api/wheel/spin
 * Spin the daily reward wheel
 */
export async function POST() {
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

    // Check if user has spins available
    if (user.dailySpinsRemaining <= 0) {
      return NextResponse.json(
        { error: 'No spins available. Come back tomorrow!' },
        { status: 400 }
      );
    }

    // Select random reward
    const reward = selectRandomReward();

    // Prepare update data
    const updateData: any = {
      dailySpinsRemaining: user.dailySpinsRemaining - 1,
      lastDailySpinAt: new Date(),
    };

    // Apply reward
    switch (reward.type) {
      case 'credits':
        updateData.powerUpAllowance = user.powerUpAllowance + reward.value;
        break;
      case 'points':
        updateData.streakPoints = user.streakPoints + reward.value;
        break;
      case 'freeze':
        updateData.streakFreezes = (user.streakFreezes || 0) + reward.value;
        break;
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { clerkId: userId },
      data: updateData,
    });

    // Save reward history
    await prisma.dailyWheelReward.create({
      data: {
        userId: user.id,
        rewardType: reward.type,
        rewardValue: reward.value,
      },
    });

    // Create notification
    let notificationMessage = '';
    switch (reward.type) {
      case 'credits':
        notificationMessage = `You won ${reward.value} power-up credit${reward.value > 1 ? 's' : ''}!`;
        break;
      case 'points':
        notificationMessage = `You won ${reward.value} points!`;
        break;
      case 'freeze':
        notificationMessage = `You won ${reward.value} streak freeze!`;
        break;
    }

    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'wheel_reward',
        title: '🎰 Daily Wheel Prize!',
        message: notificationMessage,
        link: '/wheel',
      },
    });

    return NextResponse.json({
      success: true,
      reward: {
        type: reward.type,
        value: reward.value,
        label: reward.label,
      },
      spinsRemaining: updatedUser.dailySpinsRemaining,
      newTotals: {
        credits: updatedUser.powerUpAllowance - updatedUser.powerUpUsed,
        points: updatedUser.streakPoints,
        freezes: updatedUser.streakFreezes,
      },
    });
  } catch (error) {
    console.error('[WHEEL_SPIN_POST]', error);
    return NextResponse.json(
      { error: 'Failed to spin wheel' },
      { status: 500 }
    );
  }
}

