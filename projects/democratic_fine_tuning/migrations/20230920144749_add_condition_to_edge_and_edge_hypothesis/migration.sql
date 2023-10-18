-- AlterTable
ALTER TABLE "Edge" ADD COLUMN     "condition" TEXT NOT NULL DEFAULT 'OLD';

-- AlterTable
ALTER TABLE "EdgeHypothesis" ADD COLUMN     "condition" TEXT;
