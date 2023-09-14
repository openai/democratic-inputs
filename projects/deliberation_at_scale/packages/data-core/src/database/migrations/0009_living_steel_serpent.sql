DO $$ BEGIN
 CREATE TYPE "participantStatusType" AS ENUM('queued', 'waiting_for_confirmation', 'transfering_to_room', 'in_room', 'end_of_session');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DROP INDEX IF EXISTS "ready_index";--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "status" "participantStatusType" DEFAULT 'queued' NOT NULL;--> statement-breakpoint
ALTER TABLE "participants" ADD COLUMN "last_seen_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "participants" DROP COLUMN IF EXISTS "ready";