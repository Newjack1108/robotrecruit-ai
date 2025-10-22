-- Check if migration was recorded
SELECT migration_name, finished_at, applied_steps_count 
FROM "_prisma_migrations" 
WHERE migration_name LIKE '%trial%'
ORDER BY finished_at DESC;

-- Check if columns exist in User table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'User'
  AND column_name IN ('trialEndsAt', 'messageCount', 'dailyMessageLimit', 'lastMessageReset')
ORDER BY column_name;

-- Check a sample user to see if they have trial data
SELECT 
  id,
  email,
  tier,
  "trialEndsAt",
  "messageCount",
  "dailyMessageLimit",
  "stripeCustomerId"
FROM "User"
LIMIT 3;

