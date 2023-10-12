CREATE TABLE IF NOT EXISTS "help_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"external_room_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "active_index" ON "help_requests" ("active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "created_at_index" ON "help_requests" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "updated_at_index" ON "help_requests" ("updated_at");

DO
$$
DECLARE
    row record;
BEGIN
    FOR row IN SELECT tablename FROM pg_tables AS t
        WHERE t.schemaname = 'public'
    LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', row.tablename); -- Enable RLS for all tables
    END LOOP;
END;
$$;

CREATE POLICY "Enable insert for authenticated users only" ON "public"."help_requests"
AS PERMISSIVE FOR INSERT
TO authenticated

WITH CHECK (participant_id IN (SELECT id FROM participants))

CREATE POLICY "Enable read access for authenticated" ON "public"."help_requests"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (participant_id IN (SELECT id FROM participants))
