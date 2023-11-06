-- AlterTable
ALTER TABLE "Edge" ADD COLUMN     "comment" TEXT,
ADD COLUMN     "relationship" TEXT NOT NULL DEFAULT 'upgrade';
