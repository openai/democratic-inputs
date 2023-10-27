-- DropForeignKey
ALTER TABLE "Edge" DROP CONSTRAINT "Edge_fromId_fkey";

-- DropForeignKey
ALTER TABLE "Edge" DROP CONSTRAINT "Edge_toId_fkey";

-- DropForeignKey
ALTER TABLE "EdgeHypothesis" DROP CONSTRAINT "EdgeHypothesis_fromId_fkey";

-- DropForeignKey
ALTER TABLE "EdgeHypothesis" DROP CONSTRAINT "EdgeHypothesis_toId_fkey";

-- DropForeignKey
ALTER TABLE "Impression" DROP CONSTRAINT "Impression_valuesCardId_fkey";

-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_valuesCardId_fkey";

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_valuesCardId_fkey" FOREIGN KEY ("valuesCardId") REFERENCES "CanonicalValuesCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Impression" ADD CONSTRAINT "Impression_valuesCardId_fkey" FOREIGN KEY ("valuesCardId") REFERENCES "CanonicalValuesCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Edge" ADD CONSTRAINT "Edge_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "CanonicalValuesCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Edge" ADD CONSTRAINT "Edge_toId_fkey" FOREIGN KEY ("toId") REFERENCES "CanonicalValuesCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EdgeHypothesis" ADD CONSTRAINT "EdgeHypothesis_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "CanonicalValuesCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EdgeHypothesis" ADD CONSTRAINT "EdgeHypothesis_toId_fkey" FOREIGN KEY ("toId") REFERENCES "CanonicalValuesCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;
