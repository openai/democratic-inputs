ALTER TABLE "messages" ADD COLUMN "bad_language" boolean;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "easy_language" boolean;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bad_language_index" ON "messages" ("bad_language");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "easy_language_index" ON "messages" ("easy_language");