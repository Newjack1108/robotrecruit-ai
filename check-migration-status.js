// Quick script to check if migration was applied
const { PrismaClient } = require('@prisma/client');

async function checkMigration() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Checking if trial fields exist in database...\n');
    
    // Try to query a user with the new fields
    const user = await prisma.user.findFirst({
      select: {
        email: true,
        trialEndsAt: true,
        messageCount: true,
        dailyMessageLimit: true,
      }
    });
    
    if (user) {
      console.log('✅ SUCCESS! Migration is applied.');
      console.log('📊 Sample user data:');
      console.log(JSON.stringify(user, null, 2));
      console.log('\n✅ Trial banner should work on production!');
    } else {
      console.log('⚠️  No users found, but fields exist.');
    }
    
  } catch (error) {
    console.error('❌ MIGRATION NOT APPLIED!');
    console.error('Error:', error.message);
    console.log('\n🔧 Solution: Migration needs to run on Railway.');
    console.log('The database columns do not exist yet.');
  } finally {
    await prisma.$disconnect();
  }
}

checkMigration();

