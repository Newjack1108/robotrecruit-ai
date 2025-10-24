-- Add lifetime high score field to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lifetimeHighScore" INTEGER NOT NULL DEFAULT 0;

