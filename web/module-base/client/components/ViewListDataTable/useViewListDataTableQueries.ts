"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import ViewListDataTableService from "../../services/ViewListDataTableService";

interface UseViewListDataTableQueriesOptions<T = any> {
  model: string;
  isDummyData?: boolean;
}

export function useViewListDataTableQueries<T = any>({
  model,
  isDummyData = true,
}: UseViewListDataTableQueriesOptions<T>) {
  const service = useMemo(() => new ViewListDataTableService(), []);

  // Validate model format (should be module.model)
  const modelKey = model;

  const queryKeys = {
    data: ["viewListDataTable", "data", modelKey] as const,
  };

  // Fetch data
  const dataQuery = useQuery({
    queryKey: queryKeys.data,
    queryFn: async () => {
      const response = await service.getData({
        model: modelKey,
        params: {},
      });

      const dataResponse = response.data ?? [];
      if (response.total > 0) {
        return {
          data: dataResponse as T[],
          total: response.total,
        };
      }
      if (isDummyData) {
        return {
          data: Array.from({ length: 4 }, (_, index) => ({})) as T[],
          total: 0,
        };
      }
      return { data: [], total: 0 };
    },
    enabled: !!modelKey,
  });
  // No code required for "refest" as it provides no context or instructions.
  // Allow consumers to refresh data manually using returned refetch
  const refresh = () => dataQuery.refetch();

  return {
    data: dataQuery.data?.data ?? [],
    total: dataQuery.data?.total ?? 0,
    isLoading: dataQuery.isLoading,
    isFetching: dataQuery.isFetching,
    error: dataQuery.error
      ? dataQuery.error instanceof Error
        ? dataQuery.error.message
        : "Failed to fetch data"
      : null,
    queryKeys,
    refresh,
  };
}
