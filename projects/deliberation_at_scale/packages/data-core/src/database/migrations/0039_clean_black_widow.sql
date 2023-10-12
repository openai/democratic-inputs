DO $$ BEGIN
 CREATE TYPE "helpRequestType" AS ENUM('facilitator', 'technician');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
