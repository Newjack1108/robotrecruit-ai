-- AlterTable
ALTER TABLE "DailyPuzzleSubmission"
ADD COLUMN "submittedAnswer" JSONB,
ADD COLUMN "isCorrect" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "DailyPuzzleSubmission_isCorrect_idx" ON "DailyPuzzleSubmission"("isCorrect");


