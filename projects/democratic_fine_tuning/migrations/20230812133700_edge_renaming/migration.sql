/*
  Warnings:

  - You are about to drop the column `type` on the `Edge` table. All the data in the column will be lost.
  - Added the required column `relationship` to the `Edge` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Relationship" AS ENUM ('more_comprehensive', 'incommensurable', 'dont_know');

-- AlterTable
ALTER TABLE "Edge" DROP COLUMN "type",
ADD COLUMN     "relationship" "Relationship" NOT NULL;
