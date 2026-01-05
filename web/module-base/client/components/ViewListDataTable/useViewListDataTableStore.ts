"use client";

import { useState } from "react";

import { IBaseTableColumnDefinition } from "../IBaseTable/IBaseTableInterface";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface ViewListDataTableStoreState<T = any> {
  // Search state
  search: string;

  // Column visibility state
  visibleColumns: Set<string>;

  // Filter state
  activeFilters: Set<string>;

  // Group by state
  groupBy: string | null;

  // Favorite state
  showFavorite: boolean;
}

export interface ViewListDataTableStoreActions {
  // Search actions
  setSearch: (search: string) => void;

  // Column visibility actions
  setVisibleColumns: (columns: Set<string>) => void;
  toggleColumn: (key: string) => void;

  // Filter actions
  setActiveFilters: (filters: Set<string>) => void;
  toggleFilter: (label: string) => void;
  clearFilters: () => void;

  // Group by actions
  setGroupBy: (key: string | null) => void;

  // Favorite actions
  setShowFavorite: (show: boolean) => void;
  toggleFavorite: () => void;

  // Reset actions
  reset: () => void;
}

export interface ViewListDataTableStore<T = any>
  extends ViewListDataTableStoreState<T>, ViewListDataTableStoreActions {}

function getDefaultVisibleColumns<T>(
  columns: IBaseTableColumnDefinition<T>[]
): Set<string> {
  return new Set(columns.map((c) => c.key));
}

export interface UseViewListDataTableStoreOptions<T = any> {
  columns: IBaseTableColumnDefinition<T>[];
  initialVisibleColumns?: Set<string>;
  initialSearch?: string;
  initialActiveFilters?: Set<string>;
  initialGroupBy?: string | null;
  initialShowFavorite?: boolean;
}

export function useViewListDataTableStore<T = any>(
  options: UseViewListDataTableStoreOptions<T>
): ViewListDataTableStore<T> {
  const {
    columns,
    initialVisibleColumns,
    initialSearch = "",
    initialActiveFilters,
    initialGroupBy = null,
    initialShowFavorite = false,
  } = options;

  // Initialize state
  const [search, setSearch] = useState<string>(initialSearch);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    () => initialVisibleColumns || getDefaultVisibleColumns(columns)
  );
  const [activeFilters, setActiveFilters] = useState<Set<string>>(
    initialActiveFilters || new Set()
  );
  const [groupBy, setGroupBy] = useState<string | null>(initialGroupBy);
  const [showFavorite, setShowFavorite] =
    useState<boolean>(initialShowFavorite);

  // React Compiler will automatically optimize these callbacks
  const toggleColumn = (key: string) => {
    setVisibleColumns((prev) => {
      const next = new Set(prev);

      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }

      return next;
    });
  };

  // Toggle filter
  const toggleFilter = (label: string) => {
    setActiveFilters((prev) => {
      const newSet = new Set(prev);

      if (newSet.has(label)) {
        newSet.delete(label);
      } else {
        newSet.add(label);
      }

      return newSet;
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setActiveFilters(new Set());
  };

  // Toggle favorite
  const toggleFavorite = () => {
    setShowFavorite((prev) => !prev);
  };

  // Reset all state
  const reset = () => {
    setSearch(initialSearch);
    setVisibleColumns(
      initialVisibleColumns || getDefaultVisibleColumns(columns)
    );
    setActiveFilters(initialActiveFilters || new Set());
    setGroupBy(initialGroupBy);
    setShowFavorite(initialShowFavorite);
  };

  // React Compiler will automatically optimize this object creation
  return {
    // State
    search,
    visibleColumns,
    activeFilters,
    groupBy,
    showFavorite,

    // Actions
    setSearch,
    setVisibleColumns,
    toggleColumn,
    setActiveFilters,
    toggleFilter,
    clearFilters,
    setGroupBy,
    setShowFavorite,
    toggleFavorite,
    reset,
  };
}
