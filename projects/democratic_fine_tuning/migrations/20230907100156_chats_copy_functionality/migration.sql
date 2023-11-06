-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "copiedFromId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isAdmin" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_copiedFromId_fkey" FOREIGN KEY ("copiedFromId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;
