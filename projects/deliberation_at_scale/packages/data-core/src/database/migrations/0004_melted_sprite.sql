DO $$ BEGIN
 CREATE TYPE "roomStatusType" AS ENUM('group_intro', 'safe', 'informed', 'debate', 'results');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "ready" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "rooms" ADD COLUMN "room_status_type" "roomStatusType" DEFAULT 'safe' NOT NULL;
