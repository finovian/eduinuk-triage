-- CreateEnum
CREATE TYPE "Category" AS ENUM ('academic', 'financial', 'visa_immigration', 'housing', 'health_wellbeing', 'other');

-- CreateEnum
CREATE TYPE "Urgency" AS ENUM ('low', 'medium', 'high', 'critical');

-- CreateEnum
CREATE TYPE "Disposition" AS ENUM ('handle_now', 'clarify', 'escalate', 'discard');

-- CreateEnum
CREATE TYPE "CaseStatus" AS ENUM ('OPEN', 'IN_REVIEW', 'RESOLVED', 'DISCARDED');

-- CreateTable
CREATE TABLE "Case" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "studentName" TEXT NOT NULL,
    "studentEmail" TEXT NOT NULL,
    "university" TEXT NOT NULL,
    "course" TEXT NOT NULL,
    "yearOfStudy" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "urgency" "Urgency" NOT NULL,
    "disposition" "Disposition" NOT NULL,
    "safeguardingFlag" BOOLEAN NOT NULL DEFAULT false,
    "emergencySupport" BOOLEAN NOT NULL DEFAULT false,
    "reasoning" TEXT NOT NULL,
    "studentReply" TEXT,
    "staffSummary" TEXT,
    "clarifyingQuestion" TEXT,
    "resourcesUsed" TEXT[],
    "modelUsed" TEXT NOT NULL,
    "preCheckTriggered" BOOLEAN NOT NULL DEFAULT false,
    "postCheckApplied" BOOLEAN NOT NULL DEFAULT false,
    "overrideReasons" TEXT[],
    "aiCallSucceeded" BOOLEAN NOT NULL DEFAULT false,
    "rawLlmResponse" JSONB NOT NULL,
    "status" "CaseStatus" NOT NULL DEFAULT 'OPEN',
    "assignedTo" TEXT,
    "staffNotes" TEXT,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "Case_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Case_status_idx" ON "Case"("status");

-- CreateIndex
CREATE INDEX "Case_urgency_idx" ON "Case"("urgency");

-- CreateIndex
CREATE INDEX "Case_safeguardingFlag_idx" ON "Case"("safeguardingFlag");

-- CreateIndex
CREATE INDEX "Case_createdAt_idx" ON "Case"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "Case_disposition_idx" ON "Case"("disposition");

-- CreateIndex
CREATE INDEX "Case_status_urgency_idx" ON "Case"("status", "urgency");
