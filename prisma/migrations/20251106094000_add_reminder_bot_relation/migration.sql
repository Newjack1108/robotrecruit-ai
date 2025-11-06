-- AddForeignKey (only if it doesn't exist)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Reminder_botId_fkey'
  ) THEN
    ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_botId_fkey" 
    FOREIGN KEY ("botId") REFERENCES "Bot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- CreateIndex (only if it doesn't exist)
CREATE INDEX IF NOT EXISTS "Reminder_botId_idx" ON "Reminder"("botId");

