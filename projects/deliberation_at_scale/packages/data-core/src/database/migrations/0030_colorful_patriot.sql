ALTER TABLE "opinions" ADD COLUMN "cross_pollination_id" uuid;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cross_pollination_id_index" ON "opinions" ("cross_pollination_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "opinions" ADD CONSTRAINT "opinions_cross_pollination_id_cross_pollinations_id_fk" FOREIGN KEY ("cross_pollination_id") REFERENCES "cross_pollinations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "opinions" ADD CONSTRAINT "unique_opinion" UNIQUE("outcome_id","cross_pollination_id","participant_id");