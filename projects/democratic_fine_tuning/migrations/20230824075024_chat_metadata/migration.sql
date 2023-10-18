-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "articulatorModel" TEXT NOT NULL DEFAULT 'gpt-4-0613',
ADD COLUMN     "articulatorPromptHash" TEXT NOT NULL DEFAULT 'OLD',
ADD COLUMN     "articulatorPromptVersion" TEXT NOT NULL DEFAULT 'OLD',
ADD COLUMN     "gitCommitHash" TEXT NOT NULL DEFAULT 'OLD';
