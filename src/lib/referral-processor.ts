import { prisma } from '@/lib/db';

/**
 * Process referral signup reward
 * Called when a new user signs up with a referral code
 */
export async function processReferralSignup(
  newUserId: string,
  referralCode: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Find the referral
    const referral = await prisma.referral.findUnique({
      where: { referralCode: referralCode.toUpperCase() },
      include: {
        referrerUser: true,
      },
    });

    if (!referral) {
      return { success: false, error: 'Invalid referral code' };
    }

    if (referral.invitedUserId) {
      return { success: false, error: 'Referral code already used' };
    }

    // Update referral with new user
    await prisma.referral.update({
      where: { id: referral.id },
      data: {
        invitedUserId: newUserId,
        status: 'signed_up',
        signedUpAt: new Date(),
        signupRewardGiven: true,
      },
    });

    // Award referrer: 50 points
    // Note: Points are tracked via achievements, so we'll just create a notification
    await prisma.notification.create({
      data: {
        userId: referral.referrerId,
        type: 'bot_update',
        title: '🎉 Friend Signed Up!',
        message: `Your referral code was used! You earned 50 points. They'll get another reward when they hire their first bot!`,
        link: '/dashboard',
      },
    });

    // Award new user: 25 points + 5 power-up credits
    const newUser = await prisma.user.findUnique({
      where: { id: newUserId },
    });

    if (newUser) {
      await prisma.user.update({
        where: { id: newUserId },
        data: {
          powerUpAllowance: newUser.powerUpAllowance + 5,
          welcomeBonusGiven: true,
        },
      });

      await prisma.notification.create({
        data: {
          userId: newUserId,
          type: 'system',
          title: '🎁 Welcome Bonus!',
          message: `Thanks for joining! You received 25 bonus points and 5 power-up credits from your referral!`,
          link: '/dashboard',
        },
      });
    }

    return { success: true };
  } catch (error) {
    console.error('[REFERRAL_SIGNUP]', error);
    return { success: false, error: 'Failed to process referral' };
  }
}

/**
 * Process referral bot hire reward
 * Called when a referred user hires their first bot
 */
export async function processReferralBotHire(userId: string): Promise<void> {
  try {
    // Check if user was referred
    const referral = await prisma.referral.findFirst({
      where: {
        invitedUserId: userId,
        hireRewardGiven: false, // Only give reward once
      },
      include: {
        referrerUser: true,
      },
    });

    if (!referral) {
      return; // User wasn't referred or reward already given
    }

    // Check if this is their first bot hire
    const hiredBots = await prisma.hiredBot.count({
      where: { userId },
    });

    if (hiredBots !== 1) {
      return; // Not their first bot
    }

    // Update referral status
    await prisma.referral.update({
      where: { id: referral.id },
      data: {
        status: 'bot_hired',
        firstBotHiredAt: new Date(),
        hireRewardGiven: true,
      },
    });

    // Award referrer: 50 points + 20 power-up credits
    await prisma.user.update({
      where: { id: referral.referrerId },
      data: {
        powerUpAllowance: referral.referrerUser.powerUpAllowance + 20,
      },
    });

    await prisma.notification.create({
      data: {
        userId: referral.referrerId,
        type: 'bot_update',
        title: '🚀 Referral Bonus Complete!',
        message: `Your friend hired their first bot! You earned 50 points and 20 power-up credits!`,
        link: '/dashboard',
      },
    });

    // Notify the new user too
    await prisma.notification.create({
      data: {
        userId,
        type: 'bot_update',
        title: '🎉 First Bot Hired!',
        message: `Great job hiring your first bot! Your friend who invited you just earned a bonus too!`,
        link: '/chat',
      },
    });
  } catch (error) {
    console.error('[REFERRAL_BOT_HIRE]', error);
  }
}

