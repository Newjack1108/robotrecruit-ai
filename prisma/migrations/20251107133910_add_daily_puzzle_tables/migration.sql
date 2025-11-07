-- CreateTable
CREATE TABLE "DailyPuzzle" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "puzzleConfig" JSONB NOT NULL,
    "solution" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyPuzzle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyPuzzleSubmission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "puzzleId" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "moves" INTEGER,
    "durationSeconds" INTEGER,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyPuzzleSubmission_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DailyPuzzleSubmission" ADD CONSTRAINT "DailyPuzzleSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyPuzzleSubmission" ADD CONSTRAINT "DailyPuzzleSubmission_puzzleId_fkey" FOREIGN KEY ("puzzleId") REFERENCES "DailyPuzzle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE UNIQUE INDEX "DailyPuzzle_date_key" ON "DailyPuzzle"("date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyPuzzleSubmission_userId_puzzleId_key" ON "DailyPuzzleSubmission"("userId", "puzzleId");

-- CreateIndex
CREATE INDEX "DailyPuzzleSubmission_puzzleId_idx" ON "DailyPuzzleSubmission"("puzzleId");

-- CreateIndex
CREATE INDEX "DailyPuzzleSubmission_userId_idx" ON "DailyPuzzleSubmission"("userId");

