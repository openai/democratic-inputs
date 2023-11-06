-- DropForeignKey
ALTER TABLE "ValuesCard" DROP CONSTRAINT "ValuesCard_chatId_fkey";

-- AddForeignKey
ALTER TABLE "ValuesCard" ADD CONSTRAINT "ValuesCard_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;
