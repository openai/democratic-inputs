ALTER TABLE "help_requests" ADD COLUMN "participant_id" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "help_requests" ADD CONSTRAINT "help_requests_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "participants"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

CREATE POLICY "Enable insert for authenticated users only" ON "public"."help_requests"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (participant_id IN (SELECT id FROM participants));

CREATE POLICY "Enable read access for authenticated" ON "public"."help_requests"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (participant_id IN (SELECT id FROM participants));
