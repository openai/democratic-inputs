/*
  Warnings:

  - You are about to drop the column `case` on the `Chat` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "case",
ADD COLUMN     "caseId" TEXT NOT NULL DEFAULT 'abortion';
