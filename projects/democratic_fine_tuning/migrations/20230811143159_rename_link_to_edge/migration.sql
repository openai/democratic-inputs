/*
  Warnings:

  - You are about to drop the `Link` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Link" DROP CONSTRAINT "Link_fromValueId_fkey";

-- DropForeignKey
ALTER TABLE "Link" DROP CONSTRAINT "Link_toValueId_fkey";

-- DropForeignKey
ALTER TABLE "Link" DROP CONSTRAINT "Link_userId_fkey";

-- DropTable
DROP TABLE "Link";

-- CreateTable
CREATE TABLE "Edge" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "fromValueId" INTEGER NOT NULL,
    "toValueId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Edge_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Edge" ADD CONSTRAINT "Edge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Edge" ADD CONSTRAINT "Edge_fromValueId_fkey" FOREIGN KEY ("fromValueId") REFERENCES "CanonicalValuesCard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Edge" ADD CONSTRAINT "Edge_toValueId_fkey" FOREIGN KEY ("toValueId") REFERENCES "CanonicalValuesCard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
