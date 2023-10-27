/*
  Warnings:

  - You are about to drop the column `provisionalCanonicalCard` on the `Chat` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "provisionalCanonicalCard",
ADD COLUMN     "canonicalValuesCardId" INTEGER,
ADD COLUMN     "provisionalCanonicalCardId" INTEGER;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_canonicalValuesCardId_fkey" FOREIGN KEY ("canonicalValuesCardId") REFERENCES "CanonicalValuesCard"("id") ON DELETE SET NULL ON UPDATE CASCADE;
