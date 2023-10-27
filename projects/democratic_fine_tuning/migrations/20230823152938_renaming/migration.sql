/*
  Warnings:

  - The primary key for the `Edge` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `fromValueId` on the `Edge` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `Edge` table. All the data in the column will be lost.
  - You are about to drop the column `toValueId` on the `Edge` table. All the data in the column will be lost.
  - The primary key for the `EdgeHypothesis` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `fromValueId` on the `EdgeHypothesis` table. All the data in the column will be lost.
  - You are about to drop the column `toValueId` on the `EdgeHypothesis` table. All the data in the column will be lost.
  - Added the required column `fromId` to the `Edge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `toId` to the `Edge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fromId` to the `EdgeHypothesis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `toId` to the `EdgeHypothesis` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Edge" DROP CONSTRAINT "Edge_fromValueId_fkey";

-- DropForeignKey
ALTER TABLE "Edge" DROP CONSTRAINT "Edge_toValueId_fkey";

-- DropForeignKey
ALTER TABLE "EdgeHypothesis" DROP CONSTRAINT "EdgeHypothesis_fromValueId_fkey";

-- DropForeignKey
ALTER TABLE "EdgeHypothesis" DROP CONSTRAINT "EdgeHypothesis_toValueId_fkey";

-- AlterTable
ALTER TABLE "Edge" DROP CONSTRAINT "Edge_pkey",
DROP COLUMN "fromValueId",
DROP COLUMN "id",
DROP COLUMN "toValueId",
ADD COLUMN     "fromId" INTEGER NOT NULL,
ADD COLUMN     "toId" INTEGER NOT NULL,
ADD CONSTRAINT "Edge_pkey" PRIMARY KEY ("userId", "fromId", "toId");

-- AlterTable
ALTER TABLE "EdgeHypothesis" DROP CONSTRAINT "EdgeHypothesis_pkey",
DROP COLUMN "fromValueId",
DROP COLUMN "toValueId",
ADD COLUMN     "fromId" INTEGER NOT NULL,
ADD COLUMN     "toId" INTEGER NOT NULL,
ADD CONSTRAINT "EdgeHypothesis_pkey" PRIMARY KEY ("fromId", "toId");

-- AddForeignKey
ALTER TABLE "Edge" ADD CONSTRAINT "Edge_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "CanonicalValuesCard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Edge" ADD CONSTRAINT "Edge_toId_fkey" FOREIGN KEY ("toId") REFERENCES "CanonicalValuesCard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EdgeHypothesis" ADD CONSTRAINT "EdgeHypothesis_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "CanonicalValuesCard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EdgeHypothesis" ADD CONSTRAINT "EdgeHypothesis_toId_fkey" FOREIGN KEY ("toId") REFERENCES "CanonicalValuesCard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
