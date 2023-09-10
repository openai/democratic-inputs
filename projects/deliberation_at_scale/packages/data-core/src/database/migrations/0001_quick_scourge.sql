DO $$ BEGIN
 CREATE TYPE "visibilityType" AS ENUM('public', 'private');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "visibility_type" "visibilityType" DEFAULT 'public' NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "room_id" uuid;--> statement-breakpoint
ALTER TABLE "opinions" ADD COLUMN "outcome_id" uuid;--> statement-breakpoint
ALTER TABLE "rooms" ADD COLUMN "external_room_id" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "messages" ADD CONSTRAINT "messages_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "opinions" ADD CONSTRAINT "opinions_outcome_id_outcomes_id_fk" FOREIGN KEY ("outcome_id") REFERENCES "outcomes"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
