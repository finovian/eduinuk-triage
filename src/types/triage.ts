import type { z } from "zod";
import type {
  StudentRequestSchema,
  TriageResponseSchema,
  CaseUpdateSchema,
  TriageApiResponseSchema,
} from "@/lib/triage/schema";

// Input 

export type StudentRequest = z.infer<typeof StudentRequestSchema>;

// AI Output 

export type TriageResponse = z.infer<typeof TriageResponseSchema>;

// Literal unions (for use without importing Zod)

export type Category =
  | "academic"
  | "financial"
  | "visa_immigration"
  | "housing"
  | "health_wellbeing"
  | "other";

export type Urgency = "low" | "medium" | "high" | "critical";

export type Disposition = "handle_now" | "clarify" | "escalate" | "discard";

export type CaseStatus = "new" | "in_progress" | "resolved";

// Pre-check 

export interface PreCheckFlags {
  possibleVisa: boolean;
  possibleInjection: boolean;
}

export type PreCheckResult =
  | { shortCircuit: true; reason: "immediate_danger" }
  | { shortCircuit: true; reason: "prompt_injection" }
  | { shortCircuit: false; flags: PreCheckFlags };

// Post-check 

export interface PostCheckResult extends TriageResponse {
  postCheckApplied: boolean;
  overrideReasons: string[];
}

// Service

export interface TriageServiceResult extends PostCheckResult {
  caseId: string;
  preCheckTriggered: boolean;
  aiCallSucceeded: boolean;
}

// API Response (what the client sees) 

export type TriageApiResponse = z.infer<typeof TriageApiResponseSchema>;

// Staff workflow 

export type CaseUpdate = z.infer<typeof CaseUpdateSchema>;

// DB query helpers 

export interface CaseFilters {
  status?: CaseStatus;
  urgency?: Urgency;
  category?: Category;
  disposition?: Disposition;
  safeguardingOnly?: boolean;
  page?: number;
  pageSize?: number;
}

export interface CaseStats {
  totalOpen: number;
  criticalOpen: number;
  safeguardingOpen: number;
  resolvedToday: number;
}
