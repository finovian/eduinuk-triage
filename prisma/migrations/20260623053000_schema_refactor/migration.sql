-- Clean up existing data to ensure enum variant removal doesn't fail
DELETE FROM "Case";

-- AlterEnum
BEGIN;
CREATE TYPE "CaseStatus_new" AS ENUM ('new', 'in_progress', 'resolved');
ALTER TABLE "public"."Case" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Case" ALTER COLUMN "status" TYPE "CaseStatus_new" USING ("status"::text::"CaseStatus_new");
ALTER TYPE "CaseStatus" RENAME TO "CaseStatus_old";
ALTER TYPE "CaseStatus_new" RENAME TO "CaseStatus";
DROP TYPE "public"."CaseStatus_old";
ALTER TABLE "Case" ALTER COLUMN "status" SET DEFAULT 'new';
COMMIT;

-- DropIndex
DROP INDEX "Case_disposition_idx";

-- DropIndex
DROP INDEX "Case_safeguardingFlag_idx";

-- DropIndex
DROP INDEX "Case_status_urgency_idx";

-- DropIndex
DROP INDEX "Case_urgency_idx";

-- AlterTable
ALTER TABLE "Case" DROP COLUMN "aiCallSucceeded",
DROP COLUMN "category",
DROP COLUMN "clarifyingQuestion",
DROP COLUMN "course",
DROP COLUMN "disposition",
DROP COLUMN "emergencySupport",
DROP COLUMN "modelUsed",
DROP COLUMN "overrideReasons",
DROP COLUMN "postCheckApplied",
DROP COLUMN "preCheckTriggered",
DROP COLUMN "rawLlmResponse",
DROP COLUMN "reasoning",
DROP COLUMN "resourcesUsed",
DROP COLUMN "safeguardingFlag",
DROP COLUMN "staffNotes",
DROP COLUMN "staffSummary",
DROP COLUMN "studentEmail",
DROP COLUMN "studentName",
DROP COLUMN "studentReply",
DROP COLUMN "university",
DROP COLUMN "urgency",
DROP COLUMN "yearOfStudy",
ADD COLUMN     "studentId" TEXT NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'new';

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "university" TEXT NOT NULL,
    "course" TEXT NOT NULL,
    "yearOfStudy" TEXT NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TriageResult" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "urgency" "Urgency" NOT NULL,
    "disposition" "Disposition" NOT NULL,
    "safeguardingFlag" BOOLEAN NOT NULL,
    "emergencySupport" BOOLEAN NOT NULL,
    "reasoning" TEXT NOT NULL,
    "studentReply" TEXT,
    "staffSummary" TEXT,
    "clarifyingQuestion" TEXT,
    "resourcesUsed" TEXT[],
    "modelUsed" TEXT NOT NULL,
    "aiCallSucceeded" BOOLEAN NOT NULL,
    "preCheckTriggered" BOOLEAN NOT NULL,
    "postCheckApplied" BOOLEAN NOT NULL,
    "overrideReasons" TEXT[],
    "rawLlmResponse" JSONB NOT NULL,

    CONSTRAINT "TriageResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffNote" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StaffNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Student_email_idx" ON "Student"("email");

-- CreateIndex
CREATE UNIQUE INDEX "TriageResult_caseId_key" ON "TriageResult"("caseId");

-- CreateIndex
CREATE INDEX "TriageResult_urgency_idx" ON "TriageResult"("urgency");

-- CreateIndex
CREATE INDEX "TriageResult_safeguardingFlag_idx" ON "TriageResult"("safeguardingFlag");

-- CreateIndex
CREATE INDEX "TriageResult_disposition_idx" ON "TriageResult"("disposition");

-- CreateIndex
CREATE INDEX "StaffNote_caseId_idx" ON "StaffNote"("caseId");

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TriageResult" ADD CONSTRAINT "TriageResult_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffNote" ADD CONSTRAINT "StaffNote_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;
