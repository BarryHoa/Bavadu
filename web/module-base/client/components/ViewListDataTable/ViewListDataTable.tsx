"use client";

import { Alert } from "@heroui/alert";
import { useEffect, useMemo, useState } from "react";
import ViewListDataTableService from "../../services/ViewListDataTableService";
import { DataTable, DataTableProps } from "../DataTable";

import ColumnVisibilityMenu from "./components/ColumnVisibilityMenu";
import FavoriteFilter from "./components/FavoriteFilter";
import FilterMenu, { FilterOption } from "./components/FilterMenu";
import GroupByMenu, { GroupOption } from "./components/GroupByMenu";
import SearchBar from "./components/SearchBar";
import { useViewListDataTableStore } from "./useViewListDataTableStore";

type ViewListDataTableProps<T = any> = Omit<
  DataTableProps<T>,
  "pagination" | "dataSource"
> & {
  model: string; // @module.model format (e.g., "product.variant")
  // Optional: Override fetched data
  dataSource?: T[];
  // Optional: Override fetched filter options
  filterOptions?: FilterOption<T>[];
  // Optional: Override fetched group by options
  groupByOptions?: GroupOption[];
  // Optional: Override fetched favorite filter
  initialFavoriteFilter?: (row: T) => boolean;
};

export default function ViewListDataTable<T = any>({
  columns,
  model,
  dataSource: propDataSource,
  filterOptions: propFilterOptions,
  groupByOptions: propGroupByOptions,
  initialFavoriteFilter: propInitialFavoriteFilter,
  ...dataTableProps
}: ViewListDataTableProps<T>) {
  // Service instance
  const service = useMemo(() => new ViewListDataTableService(), []);

  // State for fetched data
  const [fetchedDataSource, setFetchedDataSource] = useState<T[]>([]);
  const [fetchedFilterOptions, setFetchedFilterOptions] = useState<
    FilterOption<T>[]
  >([]);
  const [fetchedGroupByOptions, setFetchedGroupByOptions] = useState<
    GroupOption[]
  >([]);
  const [fetchedFavoriteFilter, setFetchedFavoriteFilter] = useState<
    ((row: T) => boolean) | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use the store hook - each instance gets its own store
  const store = useViewListDataTableStore({
    columns,
  });

  // Fetch data from service
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!model) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Validate modelId format (should be module.model)
        const modelId = model.includes(".") ? model : `${model}.${model}`;

        // Fetch data in parallel
        const [
          dataResponse,
          filterResponse,
          groupByResponse,
          favoriteResponse,
        ] = await Promise.allSettled([
          service.getData({
            modelId: modelId as `${string}.${string}`,
            params: {
              // Search and filters are handled locally for now
              // Can be sent to API for server-side filtering if needed
            },
          }),
          service.getFilter({
            modelId: modelId as `${string}.${string}`,
            params: {},
          }),
          service.getGroupBy({
            modelId: modelId as `${string}.${string}`,
            params: {},
          }),
          service.getFavoriteFilter({
            modelId: modelId as `${string}.${string}`,
            params: {},
          }),
        ]);

        if (!isMounted) return;

        // Handle data response
        if (dataResponse.status === "fulfilled") {
          const result = dataResponse.value;
          if (result.success && Array.isArray(result.data)) {
            setFetchedDataSource(result.data);
          }
        }

        // Handle filter response
        if (filterResponse.status === "fulfilled") {
          const result = filterResponse.value;
          if (result.success && Array.isArray(result.data)) {
            // Convert API response to FilterOption format
            const filters: FilterOption<T>[] = result.data.map((item: any) => ({
              label: item.label || item.name || String(item),
              filterFn: item.filterFn || (() => true), // Default filter function
            }));
            setFetchedFilterOptions(filters);
          }
        }

        // Handle groupBy response
        if (groupByResponse.status === "fulfilled") {
          const result = groupByResponse.value;
          if (result.success && Array.isArray(result.data)) {
            // Convert API response to GroupOption format
            const groups: GroupOption[] = result.data.map((item: any) => ({
              key: item.key || item.id || String(item),
              label: item.label || item.name || String(item),
            }));
            setFetchedGroupByOptions(groups);
          }
        }

        // Handle favorite filter response
        if (favoriteResponse.status === "fulfilled") {
          const result = favoriteResponse.value;
          if (result.success && result.data) {
            // Convert API response to filter function
            // This might need adjustment based on actual API response format
            setFetchedFavoriteFilter(
              typeof result.data === "function"
                ? result.data
                : (row: T) => {
                    // Default implementation - adjust based on API response
                    return true;
                  }
            );
          }
        }

        setLoading(false);
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Failed to fetch data");
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
    // Only refetch when model changes, not on search/filter changes (filtering is done locally)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model]);

  // Use prop values if provided, otherwise use fetched values
  const dataSource = propDataSource ?? fetchedDataSource;
  const filterOptions = propFilterOptions ?? fetchedFilterOptions;
  const groupByOptions = propGroupByOptions ?? fetchedGroupByOptions;
  const initialFavoriteFilter =
    propInitialFavoriteFilter ?? fetchedFavoriteFilter;

  // Actual filtering logic
  const filteredData = useMemo(() => {
    let filtered = [...dataSource];

    // Search
    if (store.search.trim()) {
      filtered = filtered.filter((row) =>
        columns.some(
          (col) =>
            store.visibleColumns.has(col.key) &&
            String((row as any)[col.key])
              .toLowerCase()
              .includes(store.search.trim().toLowerCase())
        )
      );
    }

    // Filters
    if (filterOptions && store.activeFilters.size > 0) {
      filtered = filtered.filter((row) =>
        filterOptions.every(
          (opt) => !store.activeFilters.has(opt.label) || opt.filterFn(row)
        )
      );
    }

    // Favorite filter
    if (store.showFavorite && initialFavoriteFilter) {
      filtered = filtered.filter(initialFavoriteFilter);
    }

    return filtered;
  }, [
    dataSource,
    store.search,
    columns,
    store.visibleColumns,
    filterOptions,
    store.activeFilters,
    store.showFavorite,
    initialFavoriteFilter,
  ]);

  // Grouped data (simple approach: flatten table with group headers)
  const processedData = useMemo(() => {
    if (store.groupBy && groupByOptions) {
      // Group rows by the selected key
      const map = new Map<string, T[]>();
      for (const row of filteredData) {
        const groupKeyValue = (row as any)[store.groupBy];
        const label =
          groupByOptions.find((g) => g.key === store.groupBy)?.label +
          ": " +
          String(groupKeyValue ?? "");
        if (!map.has(label)) {
          map.set(label, []);
        }
        map.get(label)!.push(row);
      }

      // Flatten: for each group, insert a 'header' row (fake)
      const flat: any[] = [];
      Array.from(map.entries()).forEach(([label, rows]) => {
        flat.push({ __groupHeader: true, groupLabel: label });
        flat.push(...rows);
      });
      return flat;
    }
    return filteredData;
  }, [filteredData, store.groupBy, groupByOptions]);

  // Prepare columns list with only visible columns
  const displayColumns = useMemo(() => {
    return columns.filter((col) => store.visibleColumns.has(col.key));
  }, [columns, store.visibleColumns]);

  // Render
  return (
    <div>
      {/* Actions Bar */}
      <div className="flex gap-3 items-center mb-4 flex-wrap">
        {/* Search */}
        <SearchBar value={store.search} onChange={store.setSearch} />

        {/* Show/Hide Columns */}
        <ColumnVisibilityMenu
          columns={columns}
          visibleColumns={store.visibleColumns}
          onToggleColumn={store.toggleColumn}
        />

        {/* Filter */}
        <FilterMenu
          filterOptions={filterOptions}
          activeFilters={store.activeFilters}
          onToggleFilter={store.toggleFilter}
        />

        {/* Group By */}
        {groupByOptions && (
          <GroupByMenu
            groupByOptions={groupByOptions}
            currentGroupBy={store.groupBy}
            onSelectGroupBy={store.setGroupBy}
          />
        )}

        {/* Favorite */}
        {initialFavoriteFilter && (
          <FavoriteFilter
            isActive={store.showFavorite}
            onToggle={store.toggleFavorite}
          />
        )}
      </div>

      {/* Error Display */}
      {error && (
        <Alert
          color="danger"
          variant="flat"
          title="Error loading data"
          className="mb-4"
        >
          {error}
        </Alert>
      )}

      {/* Table */}
      <DataTable
        {...dataTableProps}
        columns={displayColumns}
        dataSource={processedData}
        loading={loading || dataTableProps.loading}
      />
    </div>
  );
}
