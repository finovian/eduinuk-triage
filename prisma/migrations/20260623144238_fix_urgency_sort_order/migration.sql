-- Recreate Urgency enum to flip sort order in Postgres (critical, high, medium, low)
BEGIN;
CREATE TYPE "Urgency_new" AS ENUM ('critical', 'high', 'medium', 'low');
ALTER TABLE "TriageResult" ALTER COLUMN "urgency" TYPE "Urgency_new" USING ("urgency"::text::"Urgency_new");
ALTER TYPE "Urgency" RENAME TO "Urgency_old";
ALTER TYPE "Urgency_new" RENAME TO "Urgency";
DROP TYPE "Urgency_old";
COMMIT;
