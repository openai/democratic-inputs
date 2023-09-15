CREATE TABLE IF NOT EXISTS "job_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"job_key" text NOT NULL,
	"result" json DEFAULT '{}'::json NOT NULL,
	"completion_time_ms" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "job_key_index" ON "job_results" ("job_key");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "completion_time_ms" ON "job_results" ("completion_time_ms");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "active_index" ON "job_results" ("active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "created_at_index" ON "job_results" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "updated_at_index" ON "job_results" ("updated_at");