DO $$ BEGIN
 CREATE TYPE "opinionOptionType" AS ENUM('agree_consensus', 'disagree_consensus');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DROP INDEX IF EXISTS "option_name_index";--> statement-breakpoint
ALTER TABLE "opinions" ADD COLUMN "option_type" "opinionOptionType";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "option_type_index" ON "opinions" ("option_type");--> statement-breakpoint
ALTER TABLE "opinions" DROP COLUMN IF EXISTS "option_name";
