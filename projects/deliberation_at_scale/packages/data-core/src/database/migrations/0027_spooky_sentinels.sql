CREATE TABLE IF NOT EXISTS "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"name" text,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "demographics" json DEFAULT '{}'::json NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "starts_at_index" ON "events" ("ends_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "active_index" ON "events" ("active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "created_at_index" ON "events" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "updated_at_index" ON "events" ("updated_at");