/*
  Warnings:

  - Added the required column `drawId` to the `Vote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `valuesCardId` to the `Vote` table without a default value. This is not possible if the table is not empty.

*/
-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA "extensions";

-- AlterTable
ALTER TABLE "Vote" ADD COLUMN     "drawId" TEXT NOT NULL,
ADD COLUMN     "valuesCardId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Link" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "fromValueId" INTEGER NOT NULL,
    "toValueId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Link_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_valuesCardId_fkey" FOREIGN KEY ("valuesCardId") REFERENCES "CanonicalValuesCard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_fromValueId_fkey" FOREIGN KEY ("fromValueId") REFERENCES "CanonicalValuesCard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_toValueId_fkey" FOREIGN KEY ("toValueId") REFERENCES "CanonicalValuesCard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
