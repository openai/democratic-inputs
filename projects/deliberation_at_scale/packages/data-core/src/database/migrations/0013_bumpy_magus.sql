DROP TABLE "job_results";--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "room_status_type" "roomStatusType";--> statement-breakpoint
ALTER TABLE "moderations" ADD COLUMN "result" json DEFAULT '{}'::json NOT NULL;--> statement-breakpoint
ALTER TABLE "moderations" ADD COLUMN "completed_at" timestamp;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "completed_at_index" ON "moderations" ("completed_at");--> statement-breakpoint
ALTER TABLE "moderations" DROP COLUMN IF EXISTS "statement";