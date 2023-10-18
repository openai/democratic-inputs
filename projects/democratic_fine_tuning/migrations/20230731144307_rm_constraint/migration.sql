/*
  Warnings:

  - You are about to drop the column `userId` on the `ValuesCard` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ValuesCard" DROP CONSTRAINT "ValuesCard_userId_fkey";

-- AlterTable
ALTER TABLE "ValuesCard" DROP COLUMN "userId";
