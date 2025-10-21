-- AlterTable
ALTER TABLE "Bot" ADD COLUMN     "vectorStoreId" TEXT;

-- CreateTable
CREATE TABLE "BotFile" (
    "id" TEXT NOT NULL,
    "botId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "fileType" TEXT NOT NULL,
    "openaiFileId" TEXT NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BotFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BotFile_botId_idx" ON "BotFile"("botId");

-- AddForeignKey
ALTER TABLE "BotFile" ADD CONSTRAINT "BotFile_botId_fkey" FOREIGN KEY ("botId") REFERENCES "Bot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
