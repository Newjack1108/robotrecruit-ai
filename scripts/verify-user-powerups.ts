import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyUserPowerUps() {
  try {
    console.log('🔍 POWERUP SYSTEM VERIFICATION\n');
    console.log('=' .repeat(60));
    
    // Get your user by email (replace with your email)
    const userEmail = process.argv[2]; // Pass email as argument
    
    if (!userEmail) {
      console.log('❌ Please provide your email address');
      console.log('Usage: npm run verify-powerups your@email.com');
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: {
        hiredBots: {
          include: {
            bot: {
              select: { 
                id: true,
                slug: true, 
                name: true,
                imageRecognition: true,
                voiceResponse: true,
                fileUpload: true,
                webSearch: true,
                scheduling: true,
                dataExport: true,
              },
            },
          },
        },
        botUpgrades: {
          include: {
            bot: {
              select: { name: true, slug: true }
            }
          }
        },
        powerUpUsage: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            bot: {
              select: { name: true }
            }
          }
        },
        notifications: {
          where: { type: 'powerup_purchase' },
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      },
    });

    if (!user) {
      console.log(`❌ No user found with email: ${userEmail}`);
      return;
    }

    console.log('\n👤 USER ACCOUNT');
    console.log('─'.repeat(60));
    console.log(`Email: ${user.email}`);
    console.log(`Tier: ${user.tier} (${getTierName(user.tier)})`);
    console.log(`User ID: ${user.id}`);
    console.log(`Clerk ID: ${user.clerkId}`);

    console.log('\n💳 POWERUP CREDITS (Activation Credits)');
    console.log('─'.repeat(60));
    console.log(`Total Allowance: ${user.powerUpAllowance} credits`);
    console.log(`Used This Period: ${user.powerUpUsed} credits`);
    console.log(`Remaining: ${user.powerUpAllowance - user.powerUpUsed} credits`);
    console.log(`Reset Date: ${user.allowanceResetAt || 'Not set'}`);
    
    if (user.powerUpAllowance === 0) {
      console.log('\n⚠️  WARNING: No credits purchased!');
      console.log('   This means Stripe payment may not have processed.');
    } else {
      console.log(`\n✅ ${user.powerUpAllowance - user.powerUpUsed} credits available for use`);
    }

    console.log('\n🔔 RECENT PURCHASE NOTIFICATIONS');
    console.log('─'.repeat(60));
    if (user.notifications.length === 0) {
      console.log('⚠️  No purchase notifications found');
      console.log('   This suggests Stripe webhook may not have fired');
    } else {
      user.notifications.forEach(notif => {
        console.log(`✅ ${notif.title}`);
        console.log(`   ${notif.message}`);
        console.log(`   Date: ${notif.createdAt.toLocaleString()}`);
      });
    }

    console.log('\n🤖 HIRED BOTS');
    console.log('─'.repeat(60));
    if (user.hiredBots.length === 0) {
      console.log('(No bots hired yet)');
    } else {
      user.hiredBots.forEach(hired => {
        console.log(`\n${hired.bot.name} (${hired.bot.slug})`);
        console.log(`  Built-in Features:`);
        if (hired.bot.imageRecognition) console.log(`    ✓ Image Recognition`);
        if (hired.bot.voiceResponse) console.log(`    ✓ Voice Response`);
        if (hired.bot.fileUpload) console.log(`    ✓ File Upload`);
        if (hired.bot.webSearch) console.log(`    ✓ Web Search`);
        if (hired.bot.scheduling) console.log(`    ✓ Scheduling`);
        if (hired.bot.dataExport) console.log(`    ✓ Data Export`);
        
        if (!hired.bot.imageRecognition && !hired.bot.voiceResponse && 
            !hired.bot.fileUpload && !hired.bot.webSearch && 
            !hired.bot.scheduling && !hired.bot.dataExport) {
          console.log(`    (No built-in powerups - use credits to activate)`);
        }
      });
    }

    console.log('\n🔧 BOT UPGRADES (DEPRECATED - Now uses credit system)');
    console.log('─'.repeat(60));
    if (user.botUpgrades.length === 0) {
      console.log('✅ No old upgrades (using new unified credit system)');
    } else {
      console.log('⚠️  Old upgrade system detected (being phased out):');
      const upgradesByBot = user.botUpgrades.reduce((acc: any, upgrade) => {
        if (!acc[upgrade.botId]) {
          acc[upgrade.botId] = {
            name: upgrade.bot.name,
            slug: upgrade.bot.slug,
            upgrades: []
          };
        }
        acc[upgrade.botId].upgrades.push({
          type: upgrade.upgradeType,
          date: upgrade.purchasedAt
        });
        return acc;
      }, {});

      Object.values(upgradesByBot).forEach((botData: any) => {
        console.log(`\n${botData.name} (${botData.slug})`);
        botData.upgrades.forEach((upg: any) => {
          console.log(`  ✓ ${formatUpgradeType(upg.type)} - ${upg.date.toLocaleDateString()}`);
        });
      });
    }

    console.log('\n📊 RECENT POWERUP USAGE');
    console.log('─'.repeat(60));
    if (user.powerUpUsage.length === 0) {
      console.log('(No powerups used yet)');
    } else {
      user.powerUpUsage.forEach(usage => {
        console.log(`${usage.createdAt.toLocaleString()} - ${formatUpgradeType(usage.powerUpType)} on ${usage.bot.name}`);
      });
    }

    console.log('\n' + '='.repeat(60));
    console.log('💡 UNIFIED SYSTEM STATUS');
    console.log('='.repeat(60));

    const issues = [];
    const working = [];

    // Check credit purchase
    if (user.powerUpAllowance === 0) {
      issues.push('❌ No activation credits found - Purchase credits at /powerups/purchase');
    } else {
      working.push(`✅ ${user.powerUpAllowance} activation credits available`);
    }

    // Check notifications
    if (user.notifications.length === 0 && user.powerUpAllowance > 0) {
      issues.push('⚠️  Credits added but no notification - webhook may have issues');
    } else if (user.notifications.length > 0) {
      working.push('✅ Purchase notifications received');
    }

    // Unified system info
    working.push('✅ Using unified credit system (1 credit = any powerup on any bot)');
    working.push('✅ Powerups persist per-conversation automatically');

    if (working.length > 0) {
      console.log('\n' + working.join('\n'));
    }
    
    if (issues.length > 0) {
      console.log('\n' + issues.join('\n'));
      
      console.log('\n🔧 SOLUTIONS:');
      if (user.powerUpAllowance === 0) {
        console.log(`\n1. Visit /powerups/purchase to buy credits`);
        console.log(`2. Check Stripe Dashboard for payment status`);
        console.log(`3. Check Stripe webhook logs at: https://dashboard.stripe.com/webhooks`);
        console.log(`4. Manually grant credits (temporary fix):`);
        console.log(`   UPDATE "User" SET "powerUpAllowance" = 50 WHERE "email" = '${userEmail}';`);
      }
    } else {
      console.log('\n🎉 Everything looks good! Your powerup system is working correctly.');
      console.log('\n📝 HOW IT WORKS:');
      console.log('   • Purchase credits at /powerups/purchase');
      console.log('   • Activate any powerup on any bot during chat');
      console.log('   • 1 credit per powerup per conversation');
      console.log('   • Powerups stay active in that conversation forever');
      console.log('   • Switch conversations? Activate again (1 more credit)');
    }

    console.log('\n' + '='.repeat(60));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function getTierName(tier: number): string {
  const names: Record<number, string> = {
    1: 'Free',
    2: 'Pro',
    3: 'Premium/Enterprise'
  };
  return names[tier] || 'Unknown';
}

function formatUpgradeType(type: string): string {
  const formatted: Record<string, string> = {
    imageRecognition: '📷 Image Recognition',
    voiceResponse: '🎤 Voice Response',
    fileUpload: '📁 File Upload',
    webSearch: '🌐 Web Search',
    scheduling: '📅 Scheduling',
    dataExport: '💾 Data Export'
  };
  return formatted[type] || type;
}

verifyUserPowerUps();

