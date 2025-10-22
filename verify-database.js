// Comprehensive database verification script
const { PrismaClient } = require('@prisma/client');

async function verifyDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 DATABASE VERIFICATION REPORT\n');
    console.log('='.repeat(60));
    
    // 1. Check Users
    console.log('\n📊 USERS:');
    const totalUsers = await prisma.user.count();
    console.log(`   Total users: ${totalUsers}`);
    
    const sampleUsers = await prisma.user.findMany({
      take: 3,
      select: {
        email: true,
        tier: true,
        createdAt: true,
        trialEndsAt: true,
        messageCount: true,
        dailyMessageLimit: true,
        stripeCustomerId: true,
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log('\n   Recent users:');
    sampleUsers.forEach((user, i) => {
      console.log(`\n   ${i + 1}. ${user.email}`);
      console.log(`      Tier: ${user.tier}`);
      console.log(`      Trial ends: ${user.trialEndsAt || 'N/A'}`);
      console.log(`      Messages today: ${user.messageCount}/${user.dailyMessageLimit}`);
      console.log(`      Premium: ${user.stripeCustomerId ? 'Yes' : 'No'}`);
      console.log(`      Joined: ${user.createdAt.toLocaleDateString()}`);
    });
    
    // 2. Check Achievements
    console.log('\n\n🏆 ACHIEVEMENTS:');
    const totalAchievements = await prisma.achievement.count();
    console.log(`   Total achievements defined: ${totalAchievements}`);
    
    const unlockedCount = await prisma.userAchievement.count();
    console.log(`   Total unlocked by users: ${unlockedCount}`);
    
    if (unlockedCount > 0) {
      const recentUnlocks = await prisma.userAchievement.findMany({
        take: 5,
        include: {
          achievement: true,
          user: { select: { email: true } }
        },
        orderBy: { unlockedAt: 'desc' }
      });
      
      console.log('\n   Recent unlocks:');
      recentUnlocks.forEach((unlock, i) => {
        console.log(`\n   ${i + 1}. ${unlock.achievement.name}`);
        console.log(`      User: ${unlock.user.email}`);
        console.log(`      Points: ${unlock.achievement.points}`);
        console.log(`      Unlocked: ${unlock.unlockedAt.toLocaleDateString()}`);
      });
    } else {
      console.log('   ⚠️  No achievements unlocked yet');
    }
    
    // 3. Check Conversations & Messages
    console.log('\n\n💬 CONVERSATIONS & MESSAGES:');
    const totalConversations = await prisma.conversation.count();
    const totalMessages = await prisma.message.count();
    
    console.log(`   Total conversations: ${totalConversations}`);
    console.log(`   Total messages: ${totalMessages}`);
    
    if (totalConversations > 0) {
      const conversationsByUser = await prisma.conversation.groupBy({
        by: ['userId'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 3
      });
      
      console.log('\n   Most active users (by conversations):');
      for (const conv of conversationsByUser) {
        const user = await prisma.user.findUnique({
          where: { id: conv.userId },
          select: { email: true }
        });
        console.log(`      ${user?.email}: ${conv._count.id} conversations`);
      }
      
      const messagesByConv = await prisma.message.groupBy({
        by: ['conversationId'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 3
      });
      
      console.log('\n   Most active conversations (by messages):');
      for (const msg of messagesByConv) {
        const conversation = await prisma.conversation.findUnique({
          where: { id: msg.conversationId },
          include: { 
            user: { select: { email: true } },
            bot: { select: { name: true } }
          }
        });
        if (conversation) {
          console.log(`      ${conversation.user.email} ↔ ${conversation.bot.name}: ${msg._count.id} messages`);
        }
      }
    }
    
    // 4. Check Hired Bots
    console.log('\n\n🤖 HIRED BOTS:');
    const totalHires = await prisma.hiredBot.count();
    console.log(`   Total bot hires: ${totalHires}`);
    
    if (totalHires > 0) {
      const hiresByBot = await prisma.hiredBot.groupBy({
        by: ['botId'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5
      });
      
      console.log('\n   Most popular bots:');
      for (const hire of hiresByBot) {
        const bot = await prisma.bot.findUnique({
          where: { id: hire.botId },
          select: { name: true }
        });
        console.log(`      ${bot?.name}: ${hire._count.id} hires`);
      }
    }
    
    // 5. Check Daily Challenges
    console.log('\n\n📅 DAILY CHALLENGES:');
    const totalChallenges = await prisma.dailyChallenge.count();
    const completedChallenges = await prisma.userChallengeCompletion.count({
      where: { isCompleted: true }
    });
    
    console.log(`   Total challenges: ${totalChallenges}`);
    console.log(`   Total completions: ${completedChallenges}`);
    
    // 6. Check Streaks
    console.log('\n\n🔥 USER STREAKS:');
    const usersWithStreaks = await prisma.user.findMany({
      where: { currentStreak: { gt: 0 } },
      select: {
        email: true,
        currentStreak: true,
        longestStreak: true,
        streakPoints: true
      },
      orderBy: { currentStreak: 'desc' },
      take: 5
    });
    
    if (usersWithStreaks.length > 0) {
      console.log('   Top streaks:');
      usersWithStreaks.forEach((user, i) => {
        console.log(`      ${i + 1}. ${user.email}: ${user.currentStreak} days (longest: ${user.longestStreak}, ${user.streakPoints} points)`);
      });
    } else {
      console.log('   No active streaks yet');
    }
    
    // Summary
    console.log('\n\n' + '='.repeat(60));
    console.log('✅ DATABASE VERIFICATION COMPLETE!');
    console.log('='.repeat(60));
    
    console.log('\n📈 SUMMARY:');
    console.log(`   • ${totalUsers} users registered`);
    console.log(`   • ${totalAchievements} achievements available`);
    console.log(`   • ${unlockedCount} achievements unlocked`);
    console.log(`   • ${totalConversations} conversations created`);
    console.log(`   • ${totalMessages} messages sent`);
    console.log(`   • ${totalHires} bots hired`);
    console.log(`   • ${completedChallenges} challenges completed`);
    
    if (totalUsers > 0 && totalMessages > 0) {
      console.log('\n✅ Everything is working! Users, chats, and achievements are being stored properly.');
    } else if (totalUsers > 0) {
      console.log('\n⚠️  Users exist but no activity yet. This is normal for a new deployment.');
    } else {
      console.log('\n⚠️  No users found. Make sure users can sign up and the database is accessible.');
    }
    
  } catch (error) {
    console.error('\n❌ DATABASE ERROR:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyDatabase();

