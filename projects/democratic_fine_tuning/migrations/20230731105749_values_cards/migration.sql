-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "role" TEXT[] DEFAULT ARRAY['USER']::TEXT[],

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailCodes" (
    "email" TEXT NOT NULL,
    "loginCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "loginCodeExpiresAt" TIMESTAMP(3) NOT NULL,
    "register" BOOLEAN NOT NULL DEFAULT false,
    "extraData" JSONB
);

-- CreateTable
CREATE TABLE "ValuesCard" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "instructionsShort" TEXT NOT NULL,
    "instructionsDetailed" TEXT NOT NULL,
    "evaluationCriteria" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "canonicalCardId" INTEGER,
    "chatId" TEXT NOT NULL,

    CONSTRAINT "ValuesCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CanonicalValuesCard" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "instructionsShort" TEXT NOT NULL,
    "instructionsDetailed" TEXT NOT NULL,
    "evaluationCriteria" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CanonicalValuesCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chat" (
    "id" TEXT NOT NULL,
    "transcript" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "EmailCodes_email_key" ON "EmailCodes"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ValuesCard_chatId_key" ON "ValuesCard"("chatId");

-- AddForeignKey
ALTER TABLE "ValuesCard" ADD CONSTRAINT "ValuesCard_canonicalCardId_fkey" FOREIGN KEY ("canonicalCardId") REFERENCES "CanonicalValuesCard"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValuesCard" ADD CONSTRAINT "ValuesCard_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
