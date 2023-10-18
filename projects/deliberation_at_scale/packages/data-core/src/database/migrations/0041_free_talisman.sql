ALTER TYPE "outcomeType" ADD VALUE 'seed_statement';

BEGIN;
  ALTER POLICY "Enable update for users based on logged in user" ON "public"."users" USING (TRUE);
COMMIT;

CREATE POLICY "Enable insert for service role" ON "public"."messages"
AS PERMISSIVE FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Enable read access for all service role" ON "public"."messages"
AS PERMISSIVE FOR SELECT
TO service_role
USING (true);
