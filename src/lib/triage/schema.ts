// Zod validation schemas for the triage system.
import { z } from "zod";

export const CategoryEnum = z.enum([
  "academic",
  "financial",
  "visa_immigration",
  "housing",
  "health_wellbeing",
  "other",
]);

export const UrgencyEnum = z.enum(["low", "medium", "high", "critical"]);

export const DispositionEnum = z.enum([
  "handle_now",
  "clarify",
  "escalate",
  "discard",
]);

export const CaseStatusEnum = z.enum([
  "new",
  "in_progress",
  "resolved",
]);

// 1. Student request input 

export const StudentRequestSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100)
    .trim(),
  email: z
    .string()
    .email("Please enter a valid email address")
    .max(254),
  university: z
    .string()
    .min(1, "University is required")
    .max(200)
    .trim(),
  course: z
    .string()
    .min(1, "Course is required")
    .max(200)
    .trim(),
  year_of_study: z
    .string()
    .min(1, "Year of study is required")
    .max(50)
    .trim(),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(5000, "Message must be 5000 characters or fewer")
    .trim(),
});

// 2. AI model output 

export const TriageResponseSchema = z.object({
  category: CategoryEnum,
  urgency: UrgencyEnum,
  safeguarding_flag: z.boolean(),
  emergency_support: z.boolean(),
  disposition: DispositionEnum,
  reasoning: z.string().min(1),
  student_reply: z.string().nullable(),
  staff_summary: z.string().nullable(),
  clarifying_question: z.string().nullable(),
  resources_used: z.array(z.string()),
});

// 3. Staff workflow update 

export const CaseUpdateSchema = z.object({
  status: CaseStatusEnum.optional(),
  assignedTo: z.string().max(100).nullable().optional(),
  staffNotes: z.string().max(5000).nullable().optional(),
});

// 4. API response 

export const TriageApiResponseSchema = z.object({
  caseId: z.string(),
  disposition: DispositionEnum,
  urgency: UrgencyEnum,
  studentReply: z.string().nullable(),
  clarifyingQuestion: z.string().nullable(),
});
