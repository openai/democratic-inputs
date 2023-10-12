ALTER TABLE "help_requests" ADD COLUMN "type" "helpRequestType" DEFAULT 'facilitator' NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "type_index" ON "help_requests" ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "room_id_index" ON "help_requests" ("room_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "participant_id_index" ON "help_requests" ("participant_id");