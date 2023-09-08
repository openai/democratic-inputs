DO $$ BEGIN
 CREATE TYPE "completionType" AS ENUM('gpt4');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "crossPollinationType" AS ENUM('outcome', 'topic');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "messageType" AS ENUM('chat', 'voice', 'bot');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "moderationType" AS ENUM('harrashment', 'consensus', 'spam', 'off_topic', 'other');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "opinionType" AS ENUM('relevance_range', 'agreement_range', 'statement');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "outcomeType" AS ENUM('milestone', 'consensus', 'off_topic');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "targetType" AS ENUM('user', 'topic', 'room', 'participant', 'message', 'outcome', 'opinion', 'cross_pollination', 'completion', 'moderation');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "timingType" AS ENUM('before_room', 'during_room', 'after_room', 'standalone');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "topicType" AS ENUM('original', 'remixed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "completions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"type" "completionType" NOT NULL,
	"prompt" text NOT NULL,
	"model" json DEFAULT '{}'::json NOT NULL,
	"variables" json DEFAULT '{}'::json NOT NULL,
	"target_type" "targetType" NOT NULL,
	"user_id" uuid,
	"topic_id" uuid,
	"room_id" uuid,
	"participant_id" uuid,
	"message_id" uuid,
	"outcome_id" uuid,
	"opinion_id" uuid,
	"cross_pollination_id" uuid,
	"completion_id" uuid,
	"moderation_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cross_pollinations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"type" "crossPollinationType" NOT NULL,
	"timing_type" "timingType" DEFAULT 'during_room' NOT NULL,
	"outcome_id" uuid,
	"topic_id" uuid,
	"room_id" uuid,
	"participant_id" uuid,
	"user_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"type" "messageType" DEFAULT 'chat' NOT NULL,
	"original_message_id" uuid,
	"timing_type" "timingType" DEFAULT 'during_room' NOT NULL,
	"participant_id" uuid,
	"content" text DEFAULT '' NOT NULL,
	"embeddings" json DEFAULT '{}'::json NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "moderations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"type" "moderationType" NOT NULL,
	"statement" text DEFAULT '' NOT NULL,
	"target_type" "targetType" NOT NULL,
	"user_id" uuid,
	"topic_id" uuid,
	"room_id" uuid,
	"participant_id" uuid,
	"message_id" uuid,
	"outcome_id" uuid,
	"opinion_id" uuid,
	"cross_pollination_id" uuid,
	"completion_id" uuid,
	"moderation_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "opinions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"type" "opinionType" DEFAULT 'statement' NOT NULL,
	"range_value" integer DEFAULT 0 NOT NULL,
	"statement" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "outcome_sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"outcome_id" uuid NOT NULL,
	"message_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "outcomes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"type" "outcomeType" DEFAULT 'milestone' NOT NULL,
	"original_outcome_id" uuid,
	"content" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "participants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"room_id" uuid NOT NULL,
	"user_id" uuid,
	"nick_name" varchar(255) DEFAULT 'Anonymous' NOT NULL,
	"participation_score" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rooms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"topic_id" uuid NOT NULL,
	"starts_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "topics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"type" "topicType" DEFAULT 'original' NOT NULL,
	"original_topic_id" uuid,
	"content" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auth_user_id" uuid,
	"active" boolean DEFAULT true NOT NULL,
	"nick_name" varchar(255) DEFAULT 'Anonymous' NOT NULL,
	"demographics" json DEFAULT '{}'::json NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_auth_user_id_unique" UNIQUE("auth_user_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "completions" ADD CONSTRAINT "completions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "completions" ADD CONSTRAINT "completions_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "completions" ADD CONSTRAINT "completions_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "completions" ADD CONSTRAINT "completions_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "participants"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "completions" ADD CONSTRAINT "completions_message_id_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "completions" ADD CONSTRAINT "completions_outcome_id_outcomes_id_fk" FOREIGN KEY ("outcome_id") REFERENCES "outcomes"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "completions" ADD CONSTRAINT "completions_opinion_id_opinions_id_fk" FOREIGN KEY ("opinion_id") REFERENCES "opinions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "completions" ADD CONSTRAINT "completions_cross_pollination_id_cross_pollinations_id_fk" FOREIGN KEY ("cross_pollination_id") REFERENCES "cross_pollinations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "completions" ADD CONSTRAINT "completions_completion_id_completions_id_fk" FOREIGN KEY ("completion_id") REFERENCES "completions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "completions" ADD CONSTRAINT "completions_moderation_id_moderations_id_fk" FOREIGN KEY ("moderation_id") REFERENCES "moderations"("id") ON DELETE no action ON UPDATE no action;
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
 ALTER TABLE "cross_pollinations" ADD CONSTRAINT "cross_pollinations_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cross_pollinations" ADD CONSTRAINT "cross_pollinations_room_id_messages_id_fk" FOREIGN KEY ("room_id") REFERENCES "messages"("id") ON DELETE no action ON UPDATE no action;
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
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "messages" ADD CONSTRAINT "messages_original_message_id_messages_id_fk" FOREIGN KEY ("original_message_id") REFERENCES "messages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "messages" ADD CONSTRAINT "messages_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "participants"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "moderations" ADD CONSTRAINT "moderations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "moderations" ADD CONSTRAINT "moderations_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "moderations" ADD CONSTRAINT "moderations_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "moderations" ADD CONSTRAINT "moderations_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "participants"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "moderations" ADD CONSTRAINT "moderations_message_id_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "moderations" ADD CONSTRAINT "moderations_outcome_id_outcomes_id_fk" FOREIGN KEY ("outcome_id") REFERENCES "outcomes"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "moderations" ADD CONSTRAINT "moderations_opinion_id_opinions_id_fk" FOREIGN KEY ("opinion_id") REFERENCES "opinions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "moderations" ADD CONSTRAINT "moderations_cross_pollination_id_cross_pollinations_id_fk" FOREIGN KEY ("cross_pollination_id") REFERENCES "cross_pollinations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "moderations" ADD CONSTRAINT "moderations_completion_id_completions_id_fk" FOREIGN KEY ("completion_id") REFERENCES "completions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "moderations" ADD CONSTRAINT "moderations_moderation_id_moderations_id_fk" FOREIGN KEY ("moderation_id") REFERENCES "moderations"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "outcome_sources" ADD CONSTRAINT "outcome_sources_outcome_id_outcomes_id_fk" FOREIGN KEY ("outcome_id") REFERENCES "outcomes"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "outcome_sources" ADD CONSTRAINT "outcome_sources_message_id_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "outcomes" ADD CONSTRAINT "outcomes_original_outcome_id_outcomes_id_fk" FOREIGN KEY ("original_outcome_id") REFERENCES "outcomes"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "participants" ADD CONSTRAINT "participants_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "participants" ADD CONSTRAINT "participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rooms" ADD CONSTRAINT "rooms_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "topics" ADD CONSTRAINT "topics_original_topic_id_topics_id_fk" FOREIGN KEY ("original_topic_id") REFERENCES "topics"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;


--> CUSTOM MIGRATIONS

COMMENT ON SCHEMA public IS e'@graphql({"inflect_names": false})';

CREATE OR REPLACE FUNCTION public.current_user_id() RETURNS text AS $$
    SELECT id FROM public.users WHERE auth_user_id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

DO
$$
DECLARE
    row record;
BEGIN
    FOR row IN SELECT tablename FROM pg_tables AS t
        WHERE t.schemaname = 'public'
    LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', row.tablename); -- Enable RLS for all tables
    END LOOP;
END;
$$;
