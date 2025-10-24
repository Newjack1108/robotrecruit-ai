-- CreateTable
CREATE TABLE IF NOT EXISTS "BotToolData" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "toolType" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BotToolData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "BotToolData_conversationId_idx" ON "BotToolData"("conversationId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "BotToolData_toolType_idx" ON "BotToolData"("toolType");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "BotToolData_isActive_idx" ON "BotToolData"("isActive");

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'BotToolData_conversationId_fkey'
  ) THEN
    ALTER TABLE "BotToolData" ADD CONSTRAINT "BotToolData_conversationId_fkey" 
    FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

