-- Run this SQL in your Railway PostgreSQL database
-- Copy and paste into any PostgreSQL client connected to your Railway database

-- Step 1: Add columns to User table
ALTER TABLE "User" 
  ADD COLUMN IF NOT EXISTS "trialEndsAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "messageCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "dailyMessageLimit" INTEGER NOT NULL DEFAULT 10,
  ADD COLUMN IF NOT EXISTS "lastMessageReset" TIMESTAMP(3);

-- Step 2: Set trial dates for existing free users (7 days from their creation)
UPDATE "User"
SET "trialEndsAt" = "createdAt" + INTERVAL '7 days'
WHERE "tier" = 1 
  AND "stripeCustomerId" IS NULL 
  AND "trialEndsAt" IS NULL;

-- Step 3: Record this migration in Prisma's migration table
INSERT INTO "_prisma_migrations" (
  id, 
  checksum, 
  finished_at, 
  migration_name, 
  logs, 
  rolled_back_at, 
  started_at, 
  applied_steps_count
)
VALUES (
  gen_random_uuid(),
  'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  NOW(),
  '20251022000000_add_trial_and_message_limits',
  NULL,
  NULL,
  NOW(),
  1
)
ON CONFLICT DO NOTHING;

-- Step 4: Verify the migration was successful
SELECT 
  'Columns created:' as status,
  column_name, 
  data_type, 
  column_default
FROM information_schema.columns
WHERE table_name = 'User' 
  AND column_name IN ('trialEndsAt', 'messageCount', 'dailyMessageLimit', 'lastMessageReset')
ORDER BY column_name;

-- Step 5: Check sample user data
SELECT 
  'Sample users:' as status,
  email,
  tier,
  "trialEndsAt",
  "messageCount",
  "dailyMessageLimit"
FROM "User"
LIMIT 3;

