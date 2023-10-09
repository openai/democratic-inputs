ALTER TABLE "completions" DROP CONSTRAINT "completions_cross_pollination_id_cross_pollinations_id_fk";
--> statement-breakpoint
ALTER TABLE "moderations" DROP CONSTRAINT "moderations_cross_pollination_id_cross_pollinations_id_fk";
--> statement-breakpoint
ALTER TABLE "opinions" DROP CONSTRAINT "opinions_cross_pollination_id_cross_pollinations_id_fk";
ALTER TABLE "opinions" DROP CONSTRAINT "unique_opinion";--> statement-breakpoint
--> statement-breakpoint
ALTER TABLE "completions" DROP COLUMN IF EXISTS "cross_pollination_id";--> statement-breakpoint
ALTER TABLE "moderations" DROP COLUMN IF EXISTS "cross_pollination_id";--> statement-breakpoint
ALTER TABLE "opinions" DROP COLUMN IF EXISTS "cross_pollination_id";--> statement-breakpoint
DROP INDEX IF EXISTS "cross_pollination_id_index";--> statement-breakpoint
ALTER TABLE "outcomes" ADD COLUMN "topic_id" uuid;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "topic_id_index" ON "outcomes" ("topic_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "outcomes" ADD CONSTRAINT "outcomes_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
