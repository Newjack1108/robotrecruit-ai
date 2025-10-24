import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkStripePayments() {
  try {
    const userEmail = process.argv[2];

    if (!userEmail) {
      console.log('Usage: tsx scripts/check-stripe-payments.ts <email>');
      console.log('Example: tsx scripts/check-stripe-payments.ts user@example.com');
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: {
        id: true,
        email: true,
        stripeCustomerId: true,
        powerUpAllowance: true,
        powerUpUsed: true,
        tier: true,
        createdAt: true,
      },
    });

    if (!user) {
      console.log(`❌ User not found with email: ${userEmail}`);
      return;
    }

    console.log('👤 User Info:');
    console.log(`   Email: ${user.email}`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Stripe Customer ID: ${user.stripeCustomerId || 'Not set'}`);
    console.log(`   Tier: ${user.tier}`);
    console.log(`   Account Created: ${user.createdAt.toLocaleString()}`);
    console.log('');

    console.log('⚡ Power-Up Credits:');
    console.log(`   Total Allowance: ${user.powerUpAllowance}`);
    console.log(`   Used: ${user.powerUpUsed}`);
    console.log(`   Remaining: ${user.powerUpAllowance - user.powerUpUsed}`);
    console.log('');

    // Check notifications
    const notifications = await prisma.notification.findMany({
      where: {
        userId: user.id,
        type: 'powerup_purchase',
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    });

    console.log('🔔 Recent Power-Up Purchase Notifications:');
    if (notifications.length === 0) {
      console.log('   (No notifications found)');
    } else {
      notifications.forEach(notif => {
        console.log(`   - ${notif.title}: ${notif.message}`);
        console.log(`     Created: ${notif.createdAt.toLocaleString()}`);
      });
    }
    console.log('');

    // Check power-up usage
    const powerUpUsage = await prisma.powerUpUsage.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
      include: {
        bot: {
          select: {
            name: true,
          },
        },
      },
    });

    console.log('📊 Recent Power-Up Usage:');
    if (powerUpUsage.length === 0) {
      console.log('   (No usage found)');
    } else {
      powerUpUsage.forEach(usage => {
        console.log(`   - ${usage.powerUpType} on ${usage.bot.name}`);
        console.log(`     Used: ${usage.createdAt.toLocaleString()}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStripePayments();

