ALTER TABLE "rooms" ALTER COLUMN "starts_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "rooms" ALTER COLUMN "starts_at" DROP NOT NULL;