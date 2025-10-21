-- CreateTable
CREATE TABLE "UserBotUpgrade" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "botId" TEXT NOT NULL,
    "upgradeType" TEXT NOT NULL,
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "UserBotUpgrade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserBotUpgrade_userId_idx" ON "UserBotUpgrade"("userId");

-- CreateIndex
CREATE INDEX "UserBotUpgrade_botId_idx" ON "UserBotUpgrade"("botId");

-- CreateIndex
CREATE UNIQUE INDEX "UserBotUpgrade_userId_botId_upgradeType_key" ON "UserBotUpgrade"("userId", "botId", "upgradeType");

-- AddForeignKey
ALTER TABLE "UserBotUpgrade" ADD CONSTRAINT "UserBotUpgrade_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
