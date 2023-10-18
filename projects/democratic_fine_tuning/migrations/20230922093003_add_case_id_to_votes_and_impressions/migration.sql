-- AlterTable
ALTER TABLE "Impression" ADD COLUMN     "caseId" TEXT NOT NULL DEFAULT 'abortion';

-- AlterTable
ALTER TABLE "Vote" ADD COLUMN     "caseId" TEXT NOT NULL DEFAULT 'abortion';
