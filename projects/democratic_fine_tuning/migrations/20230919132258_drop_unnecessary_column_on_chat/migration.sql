/*
  Warnings:

  - You are about to drop the column `canonicalValuesCardId` on the `Chat` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_canonicalValuesCardId_fkey";

-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "canonicalValuesCardId";
