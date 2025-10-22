-- AlterTable
ALTER TABLE "User" ADD COLUMN "trialEndsAt" TIMESTAMP(3),
ADD COLUMN "messageCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "dailyMessageLimit" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN "lastMessageReset" TIMESTAMP(3);

-- Set trialEndsAt to 7 days from account creation for existing free users
UPDATE "User"
SET "trialEndsAt" = "createdAt" + INTERVAL '7 days'
WHERE "tier" = 1 AND "stripeCustomerId" IS NULL;

