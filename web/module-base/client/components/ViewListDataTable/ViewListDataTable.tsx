"use client";

import { useMemo } from "react";
import { DataTable } from "../DataTable";

import { Card, CardBody, Divider } from "@heroui/react";
import { useLocalizedText } from "../../hooks/useLocalizedText";
import ColumnVisibilityMenu from "./components/ColumnVisibilityMenu";
import FilterMenu from "./components/FilterMenu";
import GroupByMenu from "./components/GroupByMenu";
import SearchBar from "./components/SearchBar";
import { useViewListDataTableQueries } from "./useViewListDataTableQueries";
import { useViewListDataTableStore } from "./useViewListDataTableStore";
import { ViewListDataTableProps } from "./VieListDataTableInterface";

export default function ViewListDataTable<T = any>(
  props: ViewListDataTableProps<T>
) {
  const {
    columns,
    model,
    title,
    search,
    filter,
    groupBy,
    favorite,
    columnVisibility,
    isDummyData = true,
    ...dataTableProps
  } = props;
  // Use the store hook - each instance gets its own store
  const store = useViewListDataTableStore({
    columns,
  });
  const getLocalizedText = useLocalizedText();
  const isFilterHidden = filter?.hidden === true;
  const isSearchHidden = search?.hidden === true;
  const isGroupByHidden = groupBy?.hidden === true;
  const isFavoriteHidden = favorite?.hidden === true;
  const isColumnVisibilityHidden = columnVisibility?.hidden === true;
  // Fetch data using react-query
  const {
    data: dataSource,
    isLoading,
    error: fetchError,
  } = useViewListDataTableQueries<T>({
    model,
    isDummyData,
    // enabled: !propDataSource, // Only fetch if dataSource is not provided as prop
  });
  const filterOptions = useMemo(() => {
    return [];
  }, []);
  const groupByOptions = useMemo(() => {
    return [];
  }, []);
  const initialFavoriteFilter = useMemo(() => {
    return (row: T) => true;
  }, []);
  const favoriteFilter = useMemo(() => {
    return [];
  }, []);

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
    <Card>
      {/* Actions Bar */}
      {title && (
        <div className="flex gap-2 flex-wrap flex-col px-3 py-2">
          <h4 className="text-medium font-medium">{getLocalizedText(title)}</h4>
          <Divider className="my-0" />
        </div>
      )}

      <CardBody className={`${title ? "pt-0" : ""}`}>
        <div className="flex gap-2 items-center mb-4 flex-wrap">
          <div className="flex gap-2 flex-1 justify-start"></div>

          <div className="flex gap-2 flex-1 justify-end">
            {!isSearchHidden && (
              <SearchBar
                value={store.search}
                onChange={store.setSearch}
                placeholder={search?.placeholder}
              />
            )}
            {!isFilterHidden && (
              <FilterMenu
                filterOptions={filterOptions}
                activeFilters={store.activeFilters}
                onToggleFilter={store.toggleFilter}
              />
            )}
            {!isGroupByHidden && (
              <GroupByMenu
                groupByOptions={groupByOptions}
                currentGroupBy={store.groupBy}
                onSelectGroupBy={store.setGroupBy}
              />
            )}

            {!isColumnVisibilityHidden && (
              <ColumnVisibilityMenu
                columns={columns}
                visibleColumns={store.visibleColumns}
                onToggleColumn={store.toggleColumn}
              />
            )}
          </div>
        </div>

        {/* Table */}
        <DataTable
          {...dataTableProps}
          columns={displayColumns}
          dataSource={processedData}
          loading={isLoading || dataTableProps.loading}
        />
      </CardBody>
    </Card>
  );
}
