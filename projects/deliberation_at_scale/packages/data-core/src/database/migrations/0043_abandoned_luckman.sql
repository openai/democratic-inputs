DROP INDEX IF EXISTS "active_index";--> statement-breakpoint
DROP INDEX IF EXISTS "target_type_index";--> statement-breakpoint
DROP INDEX IF EXISTS "user_id_index";--> statement-breakpoint
DROP INDEX IF EXISTS "topic_id_index";--> statement-breakpoint
DROP INDEX IF EXISTS "room_id_index";--> statement-breakpoint
DROP INDEX IF EXISTS "participant_id_index";--> statement-breakpoint
DROP INDEX IF EXISTS "message_id_index";--> statement-breakpoint
DROP INDEX IF EXISTS "outcome_id_index";--> statement-breakpoint
DROP INDEX IF EXISTS "opinion_id_index";--> statement-breakpoint
DROP INDEX IF EXISTS "completion_id_index";--> statement-breakpoint
DROP INDEX IF EXISTS "moderation_id_index";--> statement-breakpoint
DROP INDEX IF EXISTS "created_at_index";--> statement-breakpoint
DROP INDEX IF EXISTS "updated_at_index";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "completions_active_index" ON "completions" ("active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "completions_target_type_index" ON "completions" ("target_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "completions_user_id_index" ON "completions" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "completions_topic_id_index" ON "completions" ("topic_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "completions_room_id_index" ON "completions" ("room_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "completions_participant_id_index" ON "completions" ("participant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "completions_message_id_index" ON "completions" ("message_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "completions_outcome_id_index" ON "completions" ("outcome_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "completions_opinion_id_index" ON "completions" ("opinion_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "completions_completion_id_index" ON "completions" ("completion_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "completions_moderation_id_index" ON "completions" ("moderation_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "completions_created_at_index" ON "completions" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "completions_updated_at_index" ON "completions" ("updated_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "events_active_index" ON "events" ("active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "events_created_at_index" ON "events" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "events_updated_at_index" ON "events" ("updated_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "help_requests_active_index" ON "help_requests" ("active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "help_requests_created_at_index" ON "help_requests" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "help_requests_updated_at_index" ON "help_requests" ("updated_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "messages_active_index" ON "messages" ("active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "messages_created_at_index" ON "messages" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "messages_updated_at_index" ON "messages" ("updated_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "moderations_target_type_index" ON "moderations" ("target_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "moderations_user_id_index" ON "moderations" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "moderations_topic_id_index" ON "moderations" ("topic_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "moderations_room_id_index" ON "moderations" ("room_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "moderations_participant_id_index" ON "moderations" ("participant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "moderations_message_id_index" ON "moderations" ("message_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "moderations_outcome_id_index" ON "moderations" ("outcome_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "moderations_opinion_id_index" ON "moderations" ("opinion_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "moderations_completion_id_index" ON "moderations" ("completion_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "moderations_moderation_id_index" ON "moderations" ("moderation_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "moderations_created_at_index" ON "moderations" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "moderations_updated_at_index" ON "moderations" ("updated_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "opinions_active_index" ON "opinions" ("active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "opinions_created_at_index" ON "opinions" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "opinions_updated_at_index" ON "opinions" ("updated_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "outcome_sources_active_index" ON "outcome_sources" ("active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "outcome_sources_created_at_index" ON "outcome_sources" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "outcome_sources_updated_at_index" ON "outcome_sources" ("updated_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "outcomes_active_index" ON "outcomes" ("active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "outcomes_created_at_index" ON "outcomes" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "outcomes_updated_at_index" ON "outcomes" ("updated_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "participants_active_index" ON "participants" ("active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "participants_created_at_index" ON "participants" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "participants_updated_at_index" ON "participants" ("updated_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "rooms_active_index" ON "rooms" ("active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "rooms_created_at_index" ON "rooms" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "rooms_updated_at_index" ON "rooms" ("updated_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "topics_active_index" ON "topics" ("active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "topics_created_at_index" ON "topics" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "topics_updated_at_index" ON "topics" ("updated_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_active_index" ON "users" ("active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_created_at_index" ON "users" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_updated_at_index" ON "users" ("updated_at");