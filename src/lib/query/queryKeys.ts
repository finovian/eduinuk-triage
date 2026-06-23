
import type { CaseFilters } from "@/types/triage";

export const queryKeys = {
  cases: {
    all: ["cases"] as const,
    lists: () => [...queryKeys.cases.all, "list"] as const,
    list: (filters: CaseFilters) =>
      [...queryKeys.cases.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.cases.all, "detail", id] as const,
  },
  stats: {
    all: ["stats"] as const,
  },
} as const;
