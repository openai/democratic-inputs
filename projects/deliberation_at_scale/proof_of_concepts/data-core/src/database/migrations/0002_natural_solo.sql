DO $$ BEGIN
 CREATE TYPE "crossPollinationType" AS ENUM('discussion', 'closing', 'afterwards');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cross_pollinations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"type" "crossPollinationType" DEFAULT 'discussion' NOT NULL,
	"outcome_id" uuid NOT NULL,
	"room_id" uuid,
	"participant_id" uuid,
	"user_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "outcomes" ADD COLUMN "original_outcome_id" uuid;--> statement-breakpoint
ALTER TABLE "outcomes" ADD COLUMN "content" text DEFAULT '' NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "outcomes" ADD CONSTRAINT "outcomes_original_outcome_id_outcomes_id_fk" FOREIGN KEY ("original_outcome_id") REFERENCES "outcomes"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cross_pollinations" ADD CONSTRAINT "cross_pollinations_outcome_id_outcomes_id_fk" FOREIGN KEY ("outcome_id") REFERENCES "outcomes"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cross_pollinations" ADD CONSTRAINT "cross_pollinations_room_id_discussions_id_fk" FOREIGN KEY ("room_id") REFERENCES "discussions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cross_pollinations" ADD CONSTRAINT "cross_pollinations_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "participants"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cross_pollinations" ADD CONSTRAINT "cross_pollinations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
