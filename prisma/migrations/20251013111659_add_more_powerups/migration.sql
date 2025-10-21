-- AlterTable
ALTER TABLE "Bot" ADD COLUMN     "dataExport" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "fileUpload" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "scheduling" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "voiceResponse" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "webSearch" BOOLEAN NOT NULL DEFAULT false;
