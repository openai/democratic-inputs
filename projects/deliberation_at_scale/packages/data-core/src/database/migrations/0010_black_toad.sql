CREATE INDEX IF NOT EXISTS "status_index" ON "participants" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "last_seen_at_index" ON "participants" ("last_seen_at");