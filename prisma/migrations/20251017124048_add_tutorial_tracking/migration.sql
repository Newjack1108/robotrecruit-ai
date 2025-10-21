-- AlterTable
ALTER TABLE "User" ADD COLUMN     "tutorialCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tutorialStep" INTEGER NOT NULL DEFAULT 0;
