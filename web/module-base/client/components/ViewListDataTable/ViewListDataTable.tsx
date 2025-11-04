"use client";

import { Alert } from "@heroui/alert";
import { useMemo } from "react";
import { DataTable, DataTableProps } from "../DataTable";

import ColumnVisibilityMenu from "./components/ColumnVisibilityMenu";
import FavoriteFilter from "./components/FavoriteFilter";
import FilterMenu, { FilterOption } from "./components/FilterMenu";
import GroupByMenu, { GroupOption } from "./components/GroupByMenu";
import SearchBar from "./components/SearchBar";
import { useViewListDataTableQueries } from "./useViewListDataTableQueries";
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
  ...dataTableProps
}: ViewListDataTableProps<T>) {
  // Use the store hook - each instance gets its own store
  const store = useViewListDataTableStore({
    columns,
  });

  // Fetch data using react-query
  const {
    data: dataSource,
    filters: filterOptions,
    groupByOptions: groupByOptions,
    favoriteFilter: initialFavoriteFilter,
    isLoading,
    error: fetchError,
  } = useViewListDataTableQueries<T>({
    model,
    // enabled: !propDataSource, // Only fetch if dataSource is not provided as prop
  });

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
      {fetchError && (
        <Alert
          color="danger"
          variant="flat"
          title="Error loading data"
          className="mb-4"
        >
          {fetchError}
        </Alert>
      )}

      {/* Table */}
      <DataTable
        {...dataTableProps}
        columns={displayColumns}
        dataSource={processedData}
        loading={isLoading || dataTableProps.loading}
      />
    </div>
  );
}
