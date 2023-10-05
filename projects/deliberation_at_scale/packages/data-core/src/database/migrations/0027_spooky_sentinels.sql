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
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

--> RLS helpers
CREATE OR REPLACE FUNCTION public.allow_updating_only()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  whitelist TEXT[] := TG_ARGV::TEXT[];
  schema_table TEXT;
  column_name TEXT;
  rec RECORD;
  new_value TEXT;
  old_value TEXT;
BEGIN
  schema_table := concat(TG_TABLE_SCHEMA, '.', TG_TABLE_NAME);

  -- If RLS is not active on current table for function invoker, early return
  IF NOT row_security_active(schema_table) THEN
    RETURN NEW;
  END IF;

  -- Otherwise, loop on all columns of the table schema
  FOR rec IN (
    SELECT col.column_name
    FROM information_schema.columns as col
    WHERE table_schema = TG_TABLE_SCHEMA
    AND table_name = TG_TABLE_NAME
  ) LOOP
    -- If the current column is whitelisted, early continue
    column_name := rec.column_name;
    IF column_name = ANY(whitelist) THEN
      CONTINUE;
    END IF;

    -- If not whitelisted, execute dynamic SQL to get column value from OLD and NEW records
    EXECUTE format('SELECT ($1).%I, ($2).%I', column_name, column_name)
    INTO new_value, old_value
    USING NEW, OLD;

    -- Raise exception if column value changed
    IF new_value IS DISTINCT FROM old_value THEN
      RAISE EXCEPTION 'Unauthorized change to "%"', column_name;
    END IF;
  END LOOP;

  -- RLS active, but no exception encountered, clear to proceed.
  RETURN NEW;
END;
$function$

--> participants
CREATE POLICY "Enable insert for authenticated users only" ON "public"."participants"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (user_id = current_user_id()::uuid AND room_id IS NULL)

CREATE POLICY "Enable read access to owning users and peer users" ON "public"."participants"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (user_id = current_user_id()::uuid)

CREATE POLICY "Enable update for users based on email" ON "public"."participants"
AS PERMISSIVE FOR UPDATE
TO public
USING (user_id = current_user_id()::uuid)
WITH CHECK (user_id = current_user_id()::uuid)

CREATE OR REPLACE TRIGGER participants_update_cls
  BEFORE UPDATE
  ON public.participants
  FOR EACH ROW
  EXECUTE FUNCTION allow_updating_only('last_seen_at', 'status');

--> users
CREATE POLICY "Enable read access for all users" ON "public"."users"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (auth_user_id = auth.uid())

CREATE POLICY "Enable update for users based on logged in user" ON "public"."users"
AS PERMISSIVE FOR UPDATE
TO authenticated
WITH CHECK (id = current_user_id()::uuid)

--> rooms
CREATE POLICY "Enable insert for authenticated users only" ON "public"."rooms"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (id IN (SELECT room_id FROM participants WHERE user_id = current_user_id()::uuid))

CREATE POLICY "Enable read access to authenticated" ON "public"."rooms"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (id IN (SELECT room_id FROM participants WHERE user_id = current_user_id()::uuid))

--> topics
CREATE POLICY "Enable read access for all authenticated users" ON "public"."topics"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (TRUE)

--> messages
CREATE POLICY "Enable read access for authenticated users" ON "public"."messages"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (room_id IN (SELECT id FROM rooms))

CREATE POLICY "Enable insert for authenticated users only" ON "public"."messages"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (participant_id IN (SELECT id FROM participants) AND room_id IN (SELECT id FROM rooms))


