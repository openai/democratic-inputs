ALTER TYPE "opinionType" ADD VALUE 'option';--> statement-breakpoint
ALTER TABLE "opinions" ADD COLUMN "option_name" text DEFAULT '' NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "option_name_index" ON "opinions" ("option_name");