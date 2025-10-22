// One-time migration script - run this via Railway
const { PrismaClient } = require('@prisma/client');

async function applyMigration() {
  const prisma = new PrismaClient();
  
  console.log('🚀 Applying trial system migration...\n');
  
  try {
    // Run the raw SQL migration
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "User" 
        ADD COLUMN IF NOT EXISTS "trialEndsAt" TIMESTAMP(3),
        ADD COLUMN IF NOT EXISTS "messageCount" INTEGER NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS "dailyMessageLimit" INTEGER NOT NULL DEFAULT 10,
        ADD COLUMN IF NOT EXISTS "lastMessageReset" TIMESTAMP(3);
    `);
    console.log('✅ Columns added successfully!');
    
    // Set trial dates for existing free users
    const updated = await prisma.$executeRawUnsafe(`
      UPDATE "User"
      SET "trialEndsAt" = "createdAt" + INTERVAL '7 days'
      WHERE "tier" = 1 
        AND "stripeCustomerId" IS NULL 
        AND "trialEndsAt" IS NULL;
    `);
    console.log('✅ Trial dates set for existing users!');
    
    // Record migration
    await prisma.$executeRawUnsafe(`
      INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
      VALUES (gen_random_uuid(), 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', NOW(), '20251022000000_add_trial_and_message_limits', NULL, NULL, NOW(), 1)
      ON CONFLICT DO NOTHING;
    `);
    console.log('✅ Migration recorded!');
    
    // Verify
    const users = await prisma.user.findFirst({
      select: { email: true, trialEndsAt: true, messageCount: true, dailyMessageLimit: true }
    });
    console.log('\n📊 Sample user data:', JSON.stringify(users, null, 2));
    
    console.log('\n🎉 MIGRATION COMPLETE! Restart your Railway service now.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

applyMigration();

