"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { queryKeys } from "./queryKeys";
import { casesApi, statsApi, type UpdateCasePayload } from "./api";
import type { CaseFilters } from "@/types/triage";

// Cases List 

export function useCases(filters: CaseFilters) {
  return useQuery({
    queryKey: queryKeys.cases.list(filters),
    queryFn: ({ signal }) => casesApi.list(filters, signal),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

// Case Detail 

export function useCaseDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.cases.detail(id),
    queryFn: ({ signal }) => casesApi.detail(id, signal),
    staleTime: 0,
    enabled: !!id,
  });
}

// Dashboard Stats 

export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.stats.all,
    queryFn: ({ signal }) => statsApi.get(signal),
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
}

// Update Case Mutation 

export function useUpdateCase(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateCasePayload) => casesApi.update(id, payload),

    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.cases.detail(id) });
      const previous = queryClient.getQueryData(queryKeys.cases.detail(id));

      queryClient.setQueryData(
        queryKeys.cases.detail(id),
        (old: any) => old ? { ...old, ...payload } : old
      );

      return { previous };
    },


    onError: (_err, _payload, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          queryKeys.cases.detail(id),
          context.previous
        );
      }
    },


    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cases.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.cases.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats.all });
    },
  });
}
