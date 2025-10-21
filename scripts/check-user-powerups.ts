import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUserPowerUps() {
  try {
    // Get the first user (you)
    const user = await prisma.user.findFirst({
      orderBy: { createdAt: 'asc' },
      include: {
        hiredBots: {
          include: {
            bot: {
              select: { slug: true, name: true },
            },
          },
        },
      },
    });

    if (!user) {
      console.log('❌ No user found');
      return;
    }

    console.log('👤 User Info:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Tier: ${user.tier}`);
    console.log('');

    console.log('💎 Power-Up Allowance:');
    console.log(`   Total Allowance: ${user.powerUpAllowance}`);
    console.log(`   Used: ${user.powerUpUsed}`);
    console.log(`   Remaining: ${user.powerUpAllowance - user.powerUpUsed}`);
    console.log(`   Reset At: ${user.allowanceResetAt || 'Not set'}`);
    console.log('');

    console.log('🤖 Hired Bots:');
    if (user.hiredBots.length === 0) {
      console.log('   (none hired yet)');
    } else {
      user.hiredBots.forEach(hired => {
        console.log(`   ✓ ${hired.bot.name} (${hired.bot.slug})`);
      });
    }
    console.log('');

    // Check if bee-bot is hired
    const beeBotHired = user.hiredBots.some(h => h.bot.slug === 'bee-bot');
    
    if (!beeBotHired) {
      console.log('⚠️  Bee Bot is NOT hired!');
      console.log('   Solution: Hire Bee Bot first before activating power-ups');
    } else {
      console.log('✅ Bee Bot is hired');
    }

    if (user.powerUpAllowance === 0) {
      console.log('\n⚠️  Power-up allowance is 0!');
      console.log('   Solution: Grant power-up credits or set up subscription');
      console.log('\n   To grant credits, run:');
      console.log('   UPDATE "User" SET "powerUpAllowance" = 100 WHERE "email" = \'your@email.com\';');
    } else if (user.powerUpUsed >= user.powerUpAllowance) {
      console.log('\n⚠️  All power-up credits used up!');
      console.log(`   Used: ${user.powerUpUsed} / ${user.powerUpAllowance}`);
      console.log('   Solution: Reset usage or increase allowance');
    } else {
      console.log(`\n✅ ${user.powerUpAllowance - user.powerUpUsed} power-up credits available`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserPowerUps();


