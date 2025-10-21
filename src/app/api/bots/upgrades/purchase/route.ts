import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Upgrade pricing (in cents for Stripe)
export const UPGRADE_PRICES: Record<string, { name: string; price: number; emoji: string }> = {
  imageRecognition: { name: 'Image Recognition', price: 499, emoji: '📷' }, // $4.99
  voiceResponse: { name: 'Voice Response', price: 299, emoji: '🎤' }, // $2.99
  fileUpload: { name: 'File Upload', price: 399, emoji: '📁' }, // $3.99
  webSearch: { name: 'Web Search', price: 599, emoji: '🌐' }, // $5.99
  scheduling: { name: 'Scheduling', price: 399, emoji: '📅' }, // $3.99
  dataExport: { name: 'Data Export', price: 299, emoji: '💾' }, // $2.99
};

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { botId, upgradeType } = await request.json();

    if (!botId || !upgradeType) {
      return NextResponse.json({ error: 'Bot ID and upgrade type are required' }, { status: 400 });
    }

    if (!UPGRADE_PRICES[upgradeType]) {
      return NextResponse.json({ error: 'Invalid upgrade type' }, { status: 400 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        hiredBots: true,
        botUpgrades: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if bot exists and has this upgrade available
    const bot = await prisma.bot.findUnique({
      where: { id: botId },
    });

    if (!bot) {
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
    }

    // Check if bot has this upgrade enabled
    if (!(bot as any)[upgradeType]) {
      return NextResponse.json(
        { error: 'This upgrade is not available for this bot' },
        { status: 400 }
      );
    }

    // Check if user has hired this bot
    const isHired = user.hiredBots.some(hb => hb.botId === botId);
    if (!isHired) {
      return NextResponse.json(
        { error: 'You must hire this bot before purchasing upgrades' },
        { status: 403 }
      );
    }

    // Check if already purchased
    const alreadyPurchased = user.botUpgrades.some(
      ub => ub.botId === botId && ub.upgradeType === upgradeType
    );
    if (alreadyPurchased) {
      return NextResponse.json(
        { error: 'You already own this upgrade' },
        { status: 400 }
      );
    }

    // For now, just grant the upgrade (in production, integrate with Stripe)
    // TODO: Add Stripe payment processing here
    await prisma.userBotUpgrade.create({
      data: {
        userId: user.id,
        botId: botId,
        upgradeType: upgradeType,
        // expiresAt: null, // Permanent purchase
      },
    });

    const upgradeInfo = UPGRADE_PRICES[upgradeType];
    return NextResponse.json({ 
      success: true,
      message: `${upgradeInfo.emoji} ${upgradeInfo.name} activated!`,
      upgrade: upgradeInfo
    });

  } catch (error) {
    console.error('Error purchasing upgrade:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get user's purchased upgrades for a bot
export async function GET(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const botId = searchParams.get('botId');

    if (!botId) {
      return NextResponse.json({ error: 'Bot ID is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const upgrades = await prisma.userBotUpgrade.findMany({
      where: {
        userId: user.id,
        botId: botId,
      },
    });

    return NextResponse.json(upgrades);

  } catch (error) {
    console.error('Error fetching upgrades:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


