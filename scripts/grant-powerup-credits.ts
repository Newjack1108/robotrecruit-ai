import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function grantPowerUpCredits() {
  try {
    // Get the first user
    const user = await prisma.user.findFirst({
      orderBy: { createdAt: 'asc' },
    });

    if (!user) {
      console.log('❌ No user found');
      return;
    }

    console.log('👤 Granting power-up credits to:', user.email);
    console.log(`   Current allowance: ${user.powerUpAllowance}`);
    console.log(`   Current used: ${user.powerUpUsed}`);
    console.log('');

    // Grant 100 power-up credits
    const newAllowance = 100;
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        powerUpAllowance: newAllowance,
        powerUpUsed: 0, // Reset usage
        allowanceResetAt: nextMonth,
      },
    });

    console.log('✅ Successfully granted power-up credits!');
    console.log(`   New allowance: ${newAllowance}`);
    console.log(`   Used: 0`);
    console.log(`   Available: ${newAllowance}`);
    console.log(`   Resets on: ${nextMonth.toLocaleDateString()}`);
    console.log('');
    console.log('🎉 You can now activate power-ups!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

grantPowerUpCredits();


