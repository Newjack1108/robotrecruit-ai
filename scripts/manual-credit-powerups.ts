import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function manualCreditPowerUps() {
  try {
    // Get user by email - UPDATE THIS WITH YOUR EMAIL
    const userEmail = process.argv[2];
    const creditsToAdd = parseInt(process.argv[3] || '10');

    if (!userEmail) {
      console.log('Usage: tsx scripts/manual-credit-powerups.ts <email> <credits>');
      console.log('Example: tsx scripts/manual-credit-powerups.ts user@example.com 10');
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: {
        id: true,
        email: true,
        powerUpAllowance: true,
        powerUpUsed: true,
      },
    });

    if (!user) {
      console.log(`❌ User not found with email: ${userEmail}`);
      return;
    }

    console.log('📋 Current Status:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Current Allowance: ${user.powerUpAllowance}`);
    console.log(`   Used: ${user.powerUpUsed}`);
    console.log(`   Remaining: ${user.powerUpAllowance - user.powerUpUsed}`);
    console.log('');

    const newAllowance = user.powerUpAllowance + creditsToAdd;

    console.log(`💫 Adding ${creditsToAdd} credits...`);
    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        powerUpAllowance: newAllowance,
      },
    });

    // Create a notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'powerup_purchase',
        title: 'Power-Up Credits Added! 🎉',
        message: `${creditsToAdd} power-up credits have been manually added to your account. Start using advanced features now!`,
        link: '/chat',
      },
    });

    console.log('✅ Credits added successfully!');
    console.log('');
    console.log('📊 New Status:');
    console.log(`   New Allowance: ${newAllowance}`);
    console.log(`   Used: ${user.powerUpUsed}`);
    console.log(`   Remaining: ${newAllowance - user.powerUpUsed}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

manualCreditPowerUps();

