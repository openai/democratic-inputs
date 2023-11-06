/*
  Warnings:

  - You are about to drop the column `relationship` on the `Edge` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Edge" DROP COLUMN "relationship";

-- DropEnum
DROP TYPE "Relationship";

-- CreateTable
CREATE TABLE "EdgeHypothesis" (
    "fromValueId" INTEGER NOT NULL,
    "toValueId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EdgeHypothesis_pkey" PRIMARY KEY ("fromValueId","toValueId")
);

-- AddForeignKey
ALTER TABLE "EdgeHypothesis" ADD CONSTRAINT "EdgeHypothesis_fromValueId_fkey" FOREIGN KEY ("fromValueId") REFERENCES "CanonicalValuesCard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EdgeHypothesis" ADD CONSTRAINT "EdgeHypothesis_toValueId_fkey" FOREIGN KEY ("toValueId") REFERENCES "CanonicalValuesCard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
