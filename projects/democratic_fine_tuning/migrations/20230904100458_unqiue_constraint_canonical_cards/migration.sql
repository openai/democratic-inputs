/*
  Warnings:

  - A unique constraint covering the columns `[title,instructionsShort,instructionsDetailed,evaluationCriteria]` on the table `CanonicalValuesCard` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CanonicalValuesCard_title_instructionsShort_instructionsDet_key" ON "CanonicalValuesCard"("title", "instructionsShort", "instructionsDetailed", "evaluationCriteria");
