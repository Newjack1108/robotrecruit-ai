-- CreateTable
CREATE TABLE "HiredBot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "botId" TEXT NOT NULL,
    "hiredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HiredBot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HiredBot_userId_idx" ON "HiredBot"("userId");

-- CreateIndex
CREATE INDEX "HiredBot_botId_idx" ON "HiredBot"("botId");

-- CreateIndex
CREATE UNIQUE INDEX "HiredBot_userId_botId_key" ON "HiredBot"("userId", "botId");

-- AddForeignKey
ALTER TABLE "HiredBot" ADD CONSTRAINT "HiredBot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HiredBot" ADD CONSTRAINT "HiredBot_botId_fkey" FOREIGN KEY ("botId") REFERENCES "Bot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
