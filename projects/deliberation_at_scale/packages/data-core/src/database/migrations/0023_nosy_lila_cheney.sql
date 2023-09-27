ALTER TABLE "opinions" ADD COLUMN "participant_id" uuid;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "participant_id_index" ON "opinions" ("participant_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "opinions" ADD CONSTRAINT "opinions_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "participants"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
