ALTER TABLE "help_requests" ADD COLUMN "room_id" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "help_requests" ADD CONSTRAINT "help_requests_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
