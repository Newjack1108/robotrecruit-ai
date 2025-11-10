/*
  Warnings:

  - A unique constraint covering the columns `[stripeSubscriptionId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "currentStreak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastCheckIn" TIMESTAMP(3),
ADD COLUMN     "longestStreak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "streakPoints" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "stripeSubscriptionId" TEXT,
ADD COLUMN     "subscriptionEndDate" TIMESTAMP(3),
ADD COLUMN     "subscriptionStatus" TEXT,
ADD COLUMN     "totalCheckIns" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "DailyChallenge" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 25,
    "icon" TEXT NOT NULL,
    "requirement" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserChallengeCompletion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "pointsEarned" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "UserChallengeCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserShowcase" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "relatedBotId" TEXT,
    "kudosCount" INTEGER NOT NULL DEFAULT 0,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserShowcase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShowcaseKudos" (
    "id" TEXT NOT NULL,
    "showcaseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShowcaseKudos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailySlotSpins" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "spinsUsed" INTEGER NOT NULL DEFAULT 0,
    "spinsTotal" INTEGER NOT NULL DEFAULT 10,
    "lastResetAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailySlotSpins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SlotSpinHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "result" TEXT[],
    "pointsWon" INTEGER NOT NULL,
    "creditsWon" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SlotSpinHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameScore" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gameType" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "moves" INTEGER NOT NULL,
    "timeSeconds" INTEGER NOT NULL,
    "difficulty" TEXT NOT NULL DEFAULT 'normal',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyChallenge_key_key" ON "DailyChallenge"("key");

-- CreateIndex
CREATE INDEX "DailyChallenge_dayOfWeek_idx" ON "DailyChallenge"("dayOfWeek");

-- CreateIndex
CREATE INDEX "DailyChallenge_isActive_idx" ON "DailyChallenge"("isActive");

-- CreateIndex
CREATE INDEX "UserChallengeCompletion_userId_idx" ON "UserChallengeCompletion"("userId");

-- CreateIndex
CREATE INDEX "UserChallengeCompletion_challengeId_idx" ON "UserChallengeCompletion"("challengeId");

-- CreateIndex
CREATE INDEX "UserChallengeCompletion_completedAt_idx" ON "UserChallengeCompletion"("completedAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserChallengeCompletion_userId_challengeId_completedAt_key" ON "UserChallengeCompletion"("userId", "challengeId", "completedAt");

-- CreateIndex
CREATE INDEX "UserShowcase_userId_idx" ON "UserShowcase"("userId");

-- CreateIndex
CREATE INDEX "UserShowcase_relatedBotId_idx" ON "UserShowcase"("relatedBotId");

-- CreateIndex
CREATE INDEX "UserShowcase_category_idx" ON "UserShowcase"("category");

-- CreateIndex
CREATE INDEX "UserShowcase_featured_idx" ON "UserShowcase"("featured");

-- CreateIndex
CREATE INDEX "UserShowcase_createdAt_idx" ON "UserShowcase"("createdAt");

-- CreateIndex
CREATE INDEX "ShowcaseKudos_showcaseId_idx" ON "ShowcaseKudos"("showcaseId");

-- CreateIndex
CREATE INDEX "ShowcaseKudos_userId_idx" ON "ShowcaseKudos"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ShowcaseKudos_showcaseId_userId_key" ON "ShowcaseKudos"("showcaseId", "userId");

-- CreateIndex
CREATE INDEX "DailySlotSpins_userId_idx" ON "DailySlotSpins"("userId");

-- CreateIndex
CREATE INDEX "DailySlotSpins_date_idx" ON "DailySlotSpins"("date");

-- CreateIndex
CREATE UNIQUE INDEX "DailySlotSpins_userId_date_key" ON "DailySlotSpins"("userId", "date");

-- CreateIndex
CREATE INDEX "SlotSpinHistory_userId_idx" ON "SlotSpinHistory"("userId");

-- CreateIndex
CREATE INDEX "SlotSpinHistory_createdAt_idx" ON "SlotSpinHistory"("createdAt");

-- CreateIndex
CREATE INDEX "GameScore_userId_idx" ON "GameScore"("userId");

-- CreateIndex
CREATE INDEX "GameScore_gameType_score_idx" ON "GameScore"("gameType", "score");

-- CreateIndex
CREATE INDEX "GameScore_createdAt_idx" ON "GameScore"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeSubscriptionId_key" ON "User"("stripeSubscriptionId");

-- AddForeignKey
ALTER TABLE "UserChallengeCompletion" ADD CONSTRAINT "UserChallengeCompletion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserChallengeCompletion" ADD CONSTRAINT "UserChallengeCompletion_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "DailyChallenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserShowcase" ADD CONSTRAINT "UserShowcase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserShowcase" ADD CONSTRAINT "UserShowcase_relatedBotId_fkey" FOREIGN KEY ("relatedBotId") REFERENCES "Bot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShowcaseKudos" ADD CONSTRAINT "ShowcaseKudos_showcaseId_fkey" FOREIGN KEY ("showcaseId") REFERENCES "UserShowcase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShowcaseKudos" ADD CONSTRAINT "ShowcaseKudos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailySlotSpins" ADD CONSTRAINT "DailySlotSpins_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SlotSpinHistory" ADD CONSTRAINT "SlotSpinHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameScore" ADD CONSTRAINT "GameScore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
