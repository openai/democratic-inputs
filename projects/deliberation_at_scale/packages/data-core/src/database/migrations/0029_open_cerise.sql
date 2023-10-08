ALTER TABLE "messages" RENAME COLUMN "bad_language" TO "safe_language";--> statement-breakpoint
DROP INDEX IF EXISTS "bad_language_index";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "safe_language_index" ON "messages" ("safe_language");