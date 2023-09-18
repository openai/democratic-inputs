ALTER TABLE "outcome_sources" ADD COLUMN "active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "type_index" ON "completions" ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "active_index" ON "completions" ("active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "target_type_index" ON "completions" ("target_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_id_index" ON "completions" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "topic_id_index" ON "completions" ("topic_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "room_id_index" ON "completions" ("room_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "participant_id_index" ON "completions" ("participant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "message_id_index" ON "completions" ("message_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "outcome_id_index" ON "completions" ("outcome_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "opinion_id_index" ON "completions" ("opinion_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cross_pollination_id_index" ON "completions" ("cross_pollination_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "completion_id_index" ON "completions" ("completion_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "moderation_id_index" ON "completions" ("moderation_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "created_at_index" ON "completions" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "updated_at_index" ON "completions" ("updated_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "type_index" ON "cross_pollinations" ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "timing_type_index" ON "cross_pollinations" ("timing_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "outcome_id_index" ON "cross_pollinations" ("outcome_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "topic_id_index" ON "cross_pollinations" ("topic_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "room_id_index" ON "cross_pollinations" ("room_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "participant_id_index" ON "cross_pollinations" ("participant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_id_index" ON "cross_pollinations" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "active_index" ON "cross_pollinations" ("active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "created_at_index" ON "cross_pollinations" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "updated_at_index" ON "cross_pollinations" ("updated_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "type_index" ON "messages" ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "visibility_type_index" ON "messages" ("visibility_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "timing_type_index" ON "messages" ("timing_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "original_message_id_index" ON "messages" ("original_message_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "participant_id_index" ON "messages" ("participant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "room_id_index" ON "messages" ("room_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "active_index" ON "messages" ("active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "created_at_index" ON "messages" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "updated_at_index" ON "messages" ("updated_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "type_index" ON "moderations" ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "target_type_index" ON "moderations" ("target_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_id_index" ON "moderations" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "topic_id_index" ON "moderations" ("topic_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "room_id_index" ON "moderations" ("room_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "participant_id_index" ON "moderations" ("participant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "message_id_index" ON "moderations" ("message_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "outcome_id_index" ON "moderations" ("outcome_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "opinion_id_index" ON "moderations" ("opinion_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cross_pollination_id_index" ON "moderations" ("cross_pollination_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "completion_id_index" ON "moderations" ("completion_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "moderation_id_index" ON "moderations" ("moderation_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "created_at_index" ON "moderations" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "updated_at_index" ON "moderations" ("updated_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "type_index" ON "opinions" ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "outcome_id_index" ON "opinions" ("outcome_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "range_value_index" ON "opinions" ("range_value");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "active_index" ON "opinions" ("active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "created_at_index" ON "opinions" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "updated_at_index" ON "opinions" ("updated_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "outcome_id_index" ON "outcome_sources" ("outcome_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "message_id_index" ON "outcome_sources" ("message_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "active_index" ON "outcome_sources" ("active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "created_at_index" ON "outcome_sources" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "updated_at_index" ON "outcome_sources" ("updated_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "type_index" ON "outcomes" ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "original_outcome_id_index" ON "outcomes" ("original_outcome_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "active_index" ON "outcomes" ("active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "created_at_index" ON "outcomes" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "updated_at_index" ON "outcomes" ("updated_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ready_index" ON "participants" ("ready");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "room_id_index" ON "participants" ("room_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_id_index" ON "participants" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "participation_score_index" ON "participants" ("participation_score");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "active_index" ON "participants" ("active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "created_at_index" ON "participants" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "updated_at_index" ON "participants" ("updated_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "status_type_index" ON "rooms" ("room_status_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "external_room_id_index" ON "rooms" ("external_room_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "topic_id_index" ON "rooms" ("topic_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "starts_at_index" ON "rooms" ("starts_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "active_index" ON "rooms" ("active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "created_at_index" ON "rooms" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "updated_at_index" ON "rooms" ("updated_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "type_index" ON "topics" ("type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "original_topic_id_index" ON "topics" ("original_topic_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "active_index" ON "topics" ("active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "created_at_index" ON "topics" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "updated_at_index" ON "topics" ("updated_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "auth_user_id_index" ON "users" ("auth_user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "active_index" ON "users" ("active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "created_at_index" ON "users" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "updated_at_index" ON "users" ("updated_at");