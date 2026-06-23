
import type {
  CaseFilters,
  CaseStatus,
} from "@/types/triage";

//  Types 

export interface CaseSummary {
  id: string;
  createdAt: string;
  studentName: string;
  university: string;
  course: string;
  yearOfStudy: string;
  category: string;
  urgency: string;
  disposition: string;
  safeguardingFlag: boolean;
  emergencySupport: boolean;
  status: CaseStatus;
  assignedTo: string | null;
  preCheckTriggered: boolean;
  postCheckApplied: boolean;
  aiCallSucceeded: boolean;
}

export interface CasesResponse {
  cases: CaseSummary[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CaseDetail {
  id: string;
  createdAt: string;
  updatedAt: string;
  studentName: string;
  studentEmail: string;
  university: string;
  course: string;
  yearOfStudy: string;
  message: string;
  category: string;
  urgency: string;
  disposition: string;
  safeguardingFlag: boolean;
  emergencySupport: boolean;
  reasoning: string;
  studentReply: string | null;
  staffSummary: string | null;
  clarifyingQuestion: string | null;
  resourcesUsed: string[];
  modelUsed: string;
  preCheckTriggered: boolean;
  postCheckApplied: boolean;
  overrideReasons: string[];
  aiCallSucceeded: boolean;
  rawLlmResponse: Record<string, unknown>;
  status: CaseStatus;
  assignedTo: string | null;
  staffNotes: string | null;
  resolvedAt: string | null;
}

export interface DashboardStats {
  totalOpen: number;
  criticalOpen: number;
  safeguardingOpen: number;
  resolvedToday: number;
}

export interface UpdateCasePayload {
  status?: CaseStatus;
  assignedTo?: string | null;
  staffNotes?: string | null;
}
``
//  Helper 

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error ?? `HTTP ${res.status}: ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

// Query Functions 

export function buildCasesParams(filters: CaseFilters): string {
  const params = new URLSearchParams();
  if (filters.status) params.append("status", filters.status);
  if (filters.urgency) params.append("urgency", filters.urgency);
  if (filters.category) params.append("category", filters.category);
  if (filters.disposition) params.append("disposition", filters.disposition);
  if (filters.safeguardingOnly) params.append("safeguarding", "true");
  params.append("page", String(filters.page ?? 1));
  params.append("pageSize", String(filters.pageSize ?? 10));
  return params.toString();
}

export const casesApi = {
  // GET /api/cases — paginated filtered list 
  list: (filters: CaseFilters, signal?: AbortSignal) =>
    apiFetch<CasesResponse>(`/api/cases?${buildCasesParams(filters)}`, {
      signal,
    }),

  // GET /api/cases/:id — full case detail
  detail: (id: string, signal?: AbortSignal) =>
    apiFetch<CaseDetail>(`/api/cases/${id}`, { signal }),

  // PATCH /api/cases/:id — workflow update
  update: (id: string, payload: UpdateCasePayload) =>
    apiFetch<CaseDetail>(`/api/cases/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
};

export const statsApi = {
  // GET /api/stats — dashboard summary counters
  get: (signal?: AbortSignal) =>
    apiFetch<DashboardStats>("/api/stats", { signal }),
};
