ALTER TYPE "outcomeType" ADD VALUE 'seed_statement';

BEGIN;
  ALTER POLICY "Enable update for users based on logged in user" ON "public"."users" USING (TRUE);
COMMIT;
