-- AlterTable
ALTER TABLE "CanonicalValuesCard" ADD COLUMN     "embedding" vector(1536);

-- AlterTable
ALTER TABLE "ValuesCard" ADD COLUMN     "embedding" vector(1536);
