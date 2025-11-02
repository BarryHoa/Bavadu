"use client";

import { useMemo, useState } from "react";
import { DataTable, DataTableColumn, DataTableProps } from "../DataTable";

import ColumnVisibilityMenu from "./components/ColumnVisibilityMenu";
import FavoriteFilter from "./components/FavoriteFilter";
import FilterMenu from "./components/FilterMenu";
import GroupByMenu, { GroupOption } from "./components/GroupByMenu";
import SearchBar from "./components/SearchBar";

import type { FilterOption } from "./components/FilterMenu";

type ViewListDataTableProps<T = any> = DataTableProps<T> & {
  initialFavoriteFilter?: (row: T) => boolean;
  filterOptions?: FilterOption<T>[];
  groupByOptions?: GroupOption[];
  model: `${string}.${string}`; // @module.
};

function getDefaultVisibleColumns<T>(
  columns: DataTableColumn<T>[]
): Set<string> {
  return new Set(columns.map((c) => c.key));
}

export default function ViewListDataTable<T = any>({
  columns,
  dataSource,
  initialFavoriteFilter,
  filterOptions,
  groupByOptions,
  ...dataTableProps
}: ViewListDataTableProps<T>) {
  // Search
  const [search, setSearch] = useState("");

  // Column visibility
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(() =>
    getDefaultVisibleColumns(columns)
  );
  const handleToggleColumn = (key: string) => {
    setVisibleColumns((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Filters
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const toggleFilter = (label: string) => {
    setActiveFilters((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(label)) newSet.delete(label);
      else newSet.add(label);
      return newSet;
    });
  };

  // Group by
  const [groupBy, setGroupBy] = useState<string | null>(null);

  // Favorite
  const [showFavorite, setShowFavorite] = useState(false);

  // Actual filtering logic
  const filteredData = useMemo(() => {
    let filtered = [...dataSource];

    // Search
    if (search.trim()) {
      filtered = filtered.filter((row) =>
        columns.some(
          (col) =>
            visibleColumns.has(col.key) &&
            String((row as any)[col.key])
              .toLowerCase()
              .includes(search.trim().toLowerCase())
        )
      );
    }

    // Filters
    if (filterOptions && activeFilters.size > 0) {
      filtered = filtered.filter((row) =>
        filterOptions.every(
          (opt) => !activeFilters.has(opt.label) || opt.filterFn(row)
        )
      );
    }

    // Favorite filter
    if (showFavorite && initialFavoriteFilter) {
      filtered = filtered.filter(initialFavoriteFilter);
    }

    return filtered;
  }, [
    dataSource,
    search,
    columns,
    visibleColumns,
    filterOptions,
    activeFilters,
    showFavorite,
    initialFavoriteFilter,
  ]);

  // Grouped data (simple approach: flatten table with group headers)
  const processedData = useMemo(() => {
    if (groupBy && groupByOptions) {
      // Group rows by the selected key
      const map = new Map<string, T[]>();
      for (const row of filteredData) {
        const groupKeyValue = (row as any)[groupBy];
        const label =
          groupByOptions.find((g) => g.key === groupBy)?.label +
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
  }, [filteredData, groupBy, groupByOptions]);

  // Prepare columns list with only visible columns
  const displayColumns = useMemo(() => {
    return columns.filter((col) => visibleColumns.has(col.key));
  }, [columns, visibleColumns]);

  // Render
  return (
    <div>
      {/* Actions Bar */}
      <div className="flex gap-3 items-center mb-4 flex-wrap">
        {/* Search */}
        <SearchBar value={search} onChange={setSearch} />

        {/* Show/Hide Columns */}
        <ColumnVisibilityMenu
          columns={columns}
          visibleColumns={visibleColumns}
          onToggleColumn={handleToggleColumn}
        />

        {/* Filter */}
        <FilterMenu
          filterOptions={filterOptions}
          activeFilters={activeFilters}
          onToggleFilter={toggleFilter}
        />

        {/* Group By */}
        {groupByOptions && (
          <GroupByMenu
            groupByOptions={groupByOptions}
            currentGroupBy={groupBy}
            onSelectGroupBy={setGroupBy}
          />
        )}

        {/* Favorite */}
        {initialFavoriteFilter && (
          <FavoriteFilter
            isActive={showFavorite}
            onToggle={() => setShowFavorite((f) => !f)}
          />
        )}
      </div>

      {/* Table */}
      <DataTable
        {...dataTableProps}
        columns={displayColumns}
        dataSource={processedData}
      />
    </div>
  );
}
