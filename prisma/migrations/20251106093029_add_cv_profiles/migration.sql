-- CreateTable
CREATE TABLE "CvProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CvProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CvProfile_userId_idx" ON "CvProfile"("userId");

-- CreateIndex
CREATE INDEX "CvProfile_createdAt_idx" ON "CvProfile"("createdAt");

-- AddForeignKey
ALTER TABLE "CvProfile" ADD CONSTRAINT "CvProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

