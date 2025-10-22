-- Migration: Add trial and message limit fields
ALTER TABLE "User" 
  ADD COLUMN IF NOT EXISTS "trialEndsAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "messageCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "dailyMessageLimit" INTEGER NOT NULL DEFAULT 10,
  ADD COLUMN IF NOT EXISTS "lastMessageReset" TIMESTAMP(3);

-- Set trial dates for existing free users
UPDATE "User"
SET "trialEndsAt" = "createdAt" + INTERVAL '7 days'
WHERE "tier" = 1 
  AND "stripeCustomerId" IS NULL 
  AND "trialEndsAt" IS NULL;

-- Record migration
INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
VALUES (gen_random_uuid(), 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', NOW(), '20251022000000_add_trial_and_message_limits', NULL, NULL, NOW(), 1)
ON CONFLICT DO NOTHING;

