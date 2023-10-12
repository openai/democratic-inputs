ALTER TABLE "participants" ALTER COLUMN "nick_name" SET DEFAULT 'Contributor';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "nick_name" SET DEFAULT 'Contributor';

CREATE OR REPLACE FUNCTION public.ping_participant(participant_id uuid) RETURNS uuid AS $$
	DECLARE updated_id uuid;
	BEGIN
		UPDATE participants SET last_seen_at = NOW() WHERE id = participant_id RETURNING id INTO updated_id;
	RETURN updated_id;
	END;
$$ LANGUAGE plpgsql;
