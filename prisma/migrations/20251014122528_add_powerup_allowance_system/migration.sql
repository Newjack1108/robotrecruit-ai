-- AlterTable
ALTER TABLE "User" ADD COLUMN     "allowanceResetAt" TIMESTAMP(3),
ADD COLUMN     "powerUpAllowance" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "powerUpUsed" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "PowerUpUsage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "botId" TEXT NOT NULL,
    "powerUpType" TEXT NOT NULL,
    "conversationId" TEXT,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PowerUpUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PowerUpUsage_userId_idx" ON "PowerUpUsage"("userId");

-- CreateIndex
CREATE INDEX "PowerUpUsage_botId_idx" ON "PowerUpUsage"("botId");

-- CreateIndex
CREATE INDEX "PowerUpUsage_usedAt_idx" ON "PowerUpUsage"("usedAt");

-- AddForeignKey
ALTER TABLE "PowerUpUsage" ADD CONSTRAINT "PowerUpUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
