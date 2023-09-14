ALTER TABLE "rooms" RENAME COLUMN "room_status_type" TO "status_type";--> statement-breakpoint
DROP INDEX IF EXISTS "status_type_index";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "status_type_index" ON "rooms" ("status_type");
