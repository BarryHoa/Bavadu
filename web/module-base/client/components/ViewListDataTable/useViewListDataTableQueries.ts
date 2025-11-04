"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import ViewListDataTableService from "../../services/ViewListDataTableService";
import { FilterOption } from "./components/FilterMenu";
import { GroupOption } from "./components/GroupByMenu";

type ModelId = string;

interface UseViewListDataTableQueriesOptions<T = any> {
  model: ModelId;
  enabled?: boolean;
}

export function useViewListDataTableQueries<T = any>({
  model,
  enabled = true,
}: UseViewListDataTableQueriesOptions<T>) {
  const service = useMemo(() => new ViewListDataTableService(), []);

  // Validate modelId format (should be module.model)
  const modelId = model;

  // Query key factory
  const queryKeys = {
    data: ["viewListDataTable", "data", modelId] as const,
    filters: ["viewListDataTable", "filters", modelId] as const,
    groupBy: ["viewListDataTable", "groupBy", modelId] as const,
    favoriteFilter: ["viewListDataTable", "favoriteFilter", modelId] as const,
  };

  // Fetch data
  const dataQuery = useQuery({
    queryKey: queryKeys.data,
    queryFn: async () => {
      const response = await service.getData({
        modelId,
        params: {},
      });
      if (!response.success) {
        throw new Error("Failed to fetch data");
      }
      return response.data as T[];
    },
    enabled: enabled && !!model,
  });

  // Fetch filter options
  const filtersQuery = useQuery({
    queryKey: queryKeys.filters,
    queryFn: async () => {
      const response = await service.getFilter({
        modelId,
        params: {},
      });
      if (!response.success) {
        throw new Error("Failed to fetch filters");
      }
      // Convert API response to FilterOption format
      const filters: FilterOption<T>[] = (response.data || []).map(
        (item: any) => ({
          label: item.label || item.name || String(item),
          filterFn: item.filterFn || (() => true), // Default filter function
        })
      );
      return filters;
    },
    enabled: enabled && !!model,
  });

  // Fetch groupBy options
  const groupByQuery = useQuery({
    queryKey: queryKeys.groupBy,
    queryFn: async () => {
      const response = await service.getGroupBy({
        modelId,
        params: {},
      });
      if (!response.success) {
        throw new Error("Failed to fetch groupBy options");
      }
      // Convert API response to GroupOption format
      const groups: GroupOption[] = (response.data || []).map((item: any) => ({
        key: item.key || item.id || String(item),
        label: item.label || item.name || String(item),
      }));
      return groups;
    },
    enabled: enabled && !!model,
  });

  // Fetch favorite filter
  const favoriteFilterQuery = useQuery({
    queryKey: queryKeys.favoriteFilter,
    queryFn: async () => {
      const response = await service.getFavoriteFilter({
        modelId,
        params: {},
      });
      if (!response.success) {
        throw new Error("Failed to fetch favorite filter");
      }
      // Convert API response to filter function
      if (typeof response.data === "function") {
        return response.data as (row: T) => boolean;
      }
      // Default implementation - adjust based on API response
      return ((row: T) => true) as (row: T) => boolean;
    },
    enabled: enabled && !!model,
  });

  // Combined loading state
  const isLoading =
    dataQuery.isLoading ||
    filtersQuery.isLoading ||
    groupByQuery.isLoading ||
    favoriteFilterQuery.isLoading;

  // Combined error state
  const error =
    dataQuery.error ||
    filtersQuery.error ||
    groupByQuery.error ||
    favoriteFilterQuery.error;

  return {
    // Data
    data: dataQuery.data ?? [],
    filters: filtersQuery.data ?? [],
    groupByOptions: groupByQuery.data ?? [],
    favoriteFilter: favoriteFilterQuery.data ?? null,

    // States
    isLoading,
    error: error
      ? error instanceof Error
        ? error.message
        : "Failed to fetch data"
      : null,

    // Individual query states (for more granular control if needed)
    dataQuery,
    filtersQuery,
    groupByQuery,
    favoriteFilterQuery,

    // Query keys for manual invalidation if needed
    queryKeys,
  };
}
