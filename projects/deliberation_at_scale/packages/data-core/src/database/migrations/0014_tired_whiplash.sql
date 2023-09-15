ALTER TABLE "moderations" ADD COLUMN "job_key" text;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "job_key_index" ON "moderations" ("job_key");