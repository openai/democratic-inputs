/*
  Warnings:

  - Added the required column `userId` to the `ValuesCard` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ValuesCard" ADD COLUMN     "userId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "ValuesCard" ADD CONSTRAINT "ValuesCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
