ALTER TYPE "completionType" ADD VALUE 'gpt';--> statement-breakpoint
ALTER TABLE "completions" ALTER COLUMN "target_type" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "moderations" ALTER COLUMN "target_type" DROP NOT NULL;