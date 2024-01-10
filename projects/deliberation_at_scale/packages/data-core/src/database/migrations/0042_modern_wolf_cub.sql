DROP INDEX IF EXISTS "type_index";--> statement-breakpoint
DROP INDEX IF EXISTS "starts_at_index";--> statement-breakpoint
DROP INDEX IF EXISTS "room_id_index";--> statement-breakpoint
DROP INDEX IF EXISTS "participant_id_index";--> statement-breakpoint
DROP INDEX IF EXISTS "visibility_type_index";--> statement-breakpoint
DROP INDEX IF EXISTS "timing_type_index";--> statement-breakpoint
DROP INDEX IF EXISTS "original_message_id_index";--> statement-breakpoint
DROP INDEX IF EXISTS "safe_language_index";--> statement-breakpoint
DROP INDEX IF EXISTS "easy_language_index";--> statement-breakpoint
DROP INDEX IF EXISTS "job_key_index";--> statement-breakpoint
DROP INDEX IF EXISTS "completed_at_index";--> statement-breakpoint
DROP INDEX IF EXISTS "outcome_id_index";--> statement-breakpoint
DROP INDEX IF EXISTS "range_value_index";--> statement-breakpoint
DROP INDEX IF EXISTS "option_type_index";--> statement-breakpoint
DROP INDEX IF EXISTS "message_id_index";--> statement-breakpoint
DROP INDEX IF EXISTS "topic_id_index";--> statement-breakpoint
DROP INDEX IF EXISTS "original_outcome_id_index";--> statement-breakpoint
DROP INDEX IF EXISTS "status_index";--> statement-breakpoint
DROP INDEX IF EXISTS "user_id_index";--> statement-breakpoint
DROP INDEX IF EXISTS "participation_score_index";--> statement-breakpoint
DROP INDEX IF EXISTS "last_seen_at_index";--> statement-breakpoint
DROP INDEX IF EXISTS "status_type_index";--> statement-breakpoint
DROP INDEX IF EXISTS "external_room_id_index";--> statement-breakpoint
DROP INDEX IF EXISTS "original_topic_id_index";--> statement-breakpoint
DROP INDEX IF EXISTS "auth_user_id_index";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "completions_type_index" ON "completions" ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "events_starts_at_index" ON "events" ("starts_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "events_ends_at_index" ON "events" ("ends_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "help_requests_type_index" ON "help_requests" ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "help_requests_room_id_index" ON "help_requests" ("room_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "help_requests_participant_id_index" ON "help_requests" ("participant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "messages_type_index" ON "messages" ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "messages_visibility_type_index" ON "messages" ("visibility_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "messages_timing_type_index" ON "messages" ("timing_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "messages_original_message_id_index" ON "messages" ("original_message_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "messages_participant_id_index" ON "messages" ("participant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "messages_room_id_index" ON "messages" ("room_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "messages_safe_language_index" ON "messages" ("safe_language");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "messages_easy_language_index" ON "messages" ("easy_language");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "moderations_type_index" ON "moderations" ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "moderations_job_key_index" ON "moderations" ("job_key");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "moderations_completed_at_index" ON "moderations" ("completed_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "opinions_type_index" ON "opinions" ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "opinions_outcome_id_index" ON "opinions" ("outcome_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "opinions_participant_id_index" ON "opinions" ("participant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "opinions_range_value_index" ON "opinions" ("range_value");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "opinions_option_type_index" ON "opinions" ("option_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "outcome_sources_outcome_id_index" ON "outcome_sources" ("outcome_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "outcome_sources_message_id_index" ON "outcome_sources" ("message_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "outcomes_type_index" ON "outcomes" ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "outcomes_room_id_index" ON "outcomes" ("room_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "outcomes_topic_id_index" ON "outcomes" ("topic_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "outcomes_original_outcome_id_index" ON "outcomes" ("original_outcome_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "participants_status_index" ON "participants" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "participants_room_id_index" ON "participants" ("room_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "participants_user_id_index" ON "participants" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "participants_participation_score_index" ON "participants" ("participation_score");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "participants_last_seen_at_index" ON "participants" ("last_seen_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "rooms_status_type_index" ON "rooms" ("status_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "rooms_external_room_id_index" ON "rooms" ("external_room_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "rooms_topic_id_index" ON "rooms" ("topic_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "rooms_starts_at_index" ON "rooms" ("starts_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "topics_type_index" ON "topics" ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "topics_original_topic_id_index" ON "topics" ("original_topic_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_auth_user_id_index" ON "users" ("auth_user_id");