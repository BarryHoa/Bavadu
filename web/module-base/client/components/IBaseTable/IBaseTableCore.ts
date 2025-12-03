import type { SortDescriptor } from "@react-types/shared";
import {
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getGroupedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnOrderState,
  type ColumnPinningState,
  type ColumnSizingState,
  type ExpandedState,
  type GroupingState,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type Table as TanStackTable,
  type VisibilityState,
} from "@tanstack/react-table";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

// Column Definition Type (compatible with DataTableColumnDefinition)
export interface IBaseTableCoreColumn<T = any> {
  key: string;
  title?: ReactNode;
  label?: string;
  dataIndex?: string | string[];
  align?: "start" | "center" | "end";
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  sortable?: boolean;
  fixed?: "left" | "right";
  render?: (value: any, record: T, index: number) => ReactNode;
  isResizable?: boolean;
  isDraggable?: boolean;
  enableSorting?: boolean;
  enablePinning?: boolean;
  enableResizing?: boolean;
  meta?: Record<string, any>;
}

// Props for the core hook
export interface IBaseTableCoreProps<T = any> {
  data: T[];
  columns: IBaseTableCoreColumn<T>[];
  rowKey?: string | ((record: T, index: number) => string);

  // Pagination
  pagination?:
    | {
        page?: number;
        pageSize?: number;
        total?: number;
      }
    | false;
  manualPagination?: boolean;

  // Sorting
  sorting?: SortDescriptor | undefined;
  manualSorting?: boolean;
  enableSorting?: boolean;

  // Selection
  rowSelection?:
    | {
        type?: "single" | "multiple";
        selectedRowKeys?: (string | number)[];
        onChange?: (
          selectedRowKeys: (string | number)[],
          selectedRows: T[]
        ) => void;
      }
    | false;

  // Column features
  enableColumnResizing?: boolean;
  enableColumnPinning?: boolean;
  enableColumnVisibility?: boolean;
  enableColumnOrdering?: boolean;

  // Grouping
  enableGrouping?: boolean;
  grouping?: string[];
  onGroupingChange?: (grouping: string[]) => void;
  expanded?: ExpandedState;
  onExpandedChange?: (expanded: ExpandedState) => void;

  // Callbacks
  onPaginationChange?: (page: number, pageSize: number) => void;
  onSortingChange?: (sort: SortDescriptor | undefined) => void;
  onRowSelectionChange?: (
    selectedRowKeys: (string | number)[],
    selectedRows: T[]
  ) => void;
  onColumnOrderChange?: (columnOrder: string[]) => void;
}

// Return type for the core hook
export interface IBaseTableCoreReturn<T = any> {
  table: TanStackTable<T>;
  // State
  paginationState: PaginationState;
  sortingState: SortingState;
  rowSelectionState: RowSelectionState;
  columnPinningState: ColumnPinningState;
  columnSizingState: ColumnSizingState;
  columnVisibilityState: VisibilityState;
  columnOrderState: ColumnOrderState;
  groupingState: GroupingState;
  expandedState: ExpandedState;
  // Computed
  rows: ReturnType<TanStackTable<T>["getRowModel"]>["rows"];
  headerGroups: ReturnType<TanStackTable<T>["getHeaderGroups"]>;
  visibleColumns: ReturnType<TanStackTable<T>["getVisibleLeafColumns"]>;
  selectedRows: T[];
  selectedRowKeys: (string | number)[];
  // Handlers
  setPagination: (
    pagination: PaginationState | ((prev: PaginationState) => PaginationState)
  ) => void;
  setSorting: (
    sorting: SortingState | ((prev: SortingState) => SortingState)
  ) => void;
  setRowSelection: (
    selection:
      | RowSelectionState
      | ((prev: RowSelectionState) => RowSelectionState)
  ) => void;
  setColumnOrder: (columnOrder: ColumnOrderState) => void;
  setGrouping: (grouping: GroupingState) => void;
  setExpanded: (expanded: ExpandedState) => void;
  toggleRowSelection: (rowId: string, select?: boolean) => void;
  toggleAllRowsSelection: (select?: boolean) => void;
  resetRowSelection: () => void;
}

// Convert column definition to TanStack format
function convertToTanStackColumn<T>(
  column: IBaseTableCoreColumn<T>
): ColumnDef<T> {
  const accessorKey =
    typeof column.dataIndex === "string" ? column.dataIndex : column.key;
  const useAccessorKey = accessorKey !== column.key;

  const headerValue = column.title || column.label || column.key;
  const headerFn =
    typeof headerValue === "string" || typeof headerValue === "number"
      ? () => String(headerValue)
      : () => headerValue;

  const columnDef: ColumnDef<T> = {
    id: column.key,
    ...(useAccessorKey && typeof accessorKey === "string"
      ? { accessorKey }
      : {}),
    header: headerFn,
    cell: ({ row, getValue }) => {
      if (column.render) {
        return column.render(getValue(), row.original, row.index);
      }
      return getValue() ?? null;
    },
    enableSorting: column.sortable ?? column.enableSorting ?? false,
    enablePinning: column.enablePinning ?? !!column.fixed,
    enableResizing: column.enableResizing ?? column.isResizable ?? false,
    size: column.width,
    minSize: column.minWidth,
    maxSize: column.maxWidth,
    meta: {
      ...column.meta,
      align: column.align || "start",
      fixed: column.fixed,
      isDraggable: column.isDraggable,
      originalHeader: headerValue,
    },
  };

  return columnDef;
}

// Convert SortDescriptor to TanStack SortingState
function convertToTanStackSorting(sort?: SortDescriptor): SortingState {
  if (!sort || !sort.column) return [];

  return [
    {
      id: String(sort.column),
      desc: sort.direction === "descending",
    },
  ];
}

// Convert TanStack SortingState to SortDescriptor
function convertFromTanStackSorting(
  sorting: SortingState
): SortDescriptor | undefined {
  if (sorting.length === 0) return undefined;

  const firstSort = sorting[0];
  return {
    column: firstSort.id,
    direction: firstSort.desc ? "descending" : "ascending",
  };
}

export function useIBaseTableCore<T = any>(
  props: IBaseTableCoreProps<T>
): IBaseTableCoreReturn<T> {
  const {
    data,
    columns,
    rowKey = "id",
    pagination = false,
    manualPagination = false,
    sorting,
    manualSorting = false,
    enableSorting = true,
    rowSelection = false,
    enableColumnResizing = true,
    enableColumnPinning = true,
    enableColumnVisibility = false,
    enableColumnOrdering = false,
    enableGrouping = false,
    grouping,
    onGroupingChange,
    expanded,
    onExpandedChange,
    onPaginationChange,
    onSortingChange,
    onRowSelectionChange,
    onColumnOrderChange,
  } = props;

  // Get row key function
  const getRowKey = useCallback(
    (record: T, index: number): string => {
      if (typeof rowKey === "function") {
        return String(rowKey(record, index));
      }
      const key = (record as any)[rowKey];
      return key !== undefined && key !== null ? String(key) : String(index);
    },
    [rowKey]
  );

  // Convert columns to TanStack format - memoize with stable reference
  const tanStackColumns = useMemo<ColumnDef<T>[]>(() => {
    return columns.map((col) => convertToTanStackColumn(col));
  }, [columns]);

  // Memoize column keys for columnOrderState initialization
  const columnKeys = useMemo(() => columns.map((col) => col.key), [columns]);

  // Memoize initial column pinning state
  const initialColumnPinning = useMemo<ColumnPinningState>(() => {
    const left: string[] = [];
    const right: string[] = [];

    columns.forEach((col) => {
      if (col.fixed === "left") {
        left.push(col.key);
      } else if (col.fixed === "right") {
        right.push(col.key);
      }
    });

    return { left, right };
  }, [columns]);

  // Pagination state
  const [paginationState, setPaginationState] = useState<PaginationState>(
    () => {
      if (pagination === false) {
        return { pageIndex: 0, pageSize: 10 };
      }
      return {
        pageIndex: (pagination.page ?? 1) - 1, // TanStack uses 0-based index
        pageSize: pagination.pageSize ?? 10,
      };
    }
  );

  // Sorting state
  const [sortingState, setSortingState] = useState<SortingState>(() =>
    convertToTanStackSorting(sorting)
  );

  // Row selection state
  const [rowSelectionState, setRowSelectionState] = useState<RowSelectionState>(
    () => {
      if (rowSelection === false) return {};

      const selectedKeys = rowSelection.selectedRowKeys || [];
      const selectionMap: RowSelectionState = {};
      selectedKeys.forEach((key) => {
        selectionMap[String(key)] = true;
      });
      return selectionMap;
    }
  );

  // Column pinning state (for frozen columns)
  const [columnPinningState, setColumnPinningState] =
    useState<ColumnPinningState>(() => initialColumnPinning);

  // Column sizing state
  const [columnSizingState, setColumnSizingState] = useState<ColumnSizingState>(
    {}
  );

  // Column visibility state
  const [columnVisibilityState, setColumnVisibilityState] =
    useState<VisibilityState>({});

  // Column ordering state (for drag & drop) - sync with column keys changes
  const [columnOrderState, setColumnOrderState] = useState<ColumnOrderState>(
    () => columnKeys
  );

  // Sync column order when columns change
  useEffect(() => {
    setColumnOrderState((prev) => {
      const currentKeys = new Set(prev);
      const newKeys = new Set(columnKeys);

      // Check if order changed
      if (
        prev.length !== columnKeys.length ||
        !columnKeys.every((key) => currentKeys.has(key)) ||
        !prev.every((key) => newKeys.has(key))
      ) {
        // Merge: keep existing order for existing columns, add new ones at end
        const merged: string[] = [];
        const existingSet = new Set(prev);

        // Keep existing order
        prev.forEach((key) => {
          if (newKeys.has(key)) {
            merged.push(key);
            existingSet.delete(key);
          }
        });

        // Add new columns at end
        columnKeys.forEach((key) => {
          if (
            !existingSet.has(key) &&
            newKeys.has(key) &&
            !merged.includes(key)
          ) {
            merged.push(key);
          }
        });

        return merged.length > 0 ? merged : columnKeys;
      }

      return prev;
    });
  }, [columnKeys]);

  // Grouping state
  const [groupingState, setGroupingState] = useState<GroupingState>(
    () => grouping || []
  );

  // Expanded state (for grouped rows)
  const [expandedState, setExpandedState] = useState<ExpandedState>(
    () => expanded || {}
  );

  // Sync external sorting changes - memoize conversion
  const externalSortingState = useMemo(
    () => (sorting !== undefined ? convertToTanStackSorting(sorting) : null),
    [sorting]
  );

  useEffect(() => {
    if (externalSortingState !== null) {
      setSortingState((prev) => {
        // Only update if different
        if (
          prev.length !== externalSortingState.length ||
          (prev.length > 0 &&
            (prev[0].id !== externalSortingState[0].id ||
              prev[0].desc !== externalSortingState[0].desc))
        ) {
          return externalSortingState;
        }
        return prev;
      });
    }
  }, [externalSortingState]);

  // Sync external pagination changes - memoize derived values
  const externalPagination = useMemo(() => {
    if (pagination && typeof pagination === "object") {
      return {
        pageIndex: (pagination.page ?? 1) - 1,
        pageSize: pagination.pageSize ?? 10,
      };
    }
    return null;
  }, [pagination]);

  useEffect(() => {
    if (externalPagination !== null) {
      setPaginationState((prev) => {
        if (
          prev.pageIndex !== externalPagination.pageIndex ||
          prev.pageSize !== externalPagination.pageSize
        ) {
          return externalPagination;
        }
        return prev;
      });
    }
  }, [externalPagination]);

  // Sync external grouping changes - only update if different
  useEffect(() => {
    if (grouping !== undefined) {
      setGroupingState((prev) => {
        const prevStr = JSON.stringify(prev);
        const newStr = JSON.stringify(grouping);
        if (prevStr !== newStr) {
          return grouping;
        }
        return prev;
      });
    }
  }, [grouping]);

  // Sync external expanded changes - only update if different
  useEffect(() => {
    if (expanded !== undefined) {
      setExpandedState((prev) => {
        const prevStr = JSON.stringify(prev);
        const newStr = JSON.stringify(expanded);
        if (prevStr !== newStr) {
          return expanded;
        }
        return prev;
      });
    }
  }, [expanded]);

  // Memoize handlers to prevent recreation
  const handlePaginationChange = useCallback(
    (updater: any) => {
      setPaginationState((prev) => {
        const newPagination =
          typeof updater === "function" ? updater(prev) : updater;

        if (onPaginationChange) {
          onPaginationChange(
            newPagination.pageIndex + 1,
            newPagination.pageSize
          );
        }

        return newPagination;
      });
    },
    [onPaginationChange]
  );

  const handleSortingChange = useCallback(
    (updater: any) => {
      setSortingState((prev) => {
        const newSorting =
          typeof updater === "function" ? updater(prev) : updater;

        if (onSortingChange) {
          const sortDescriptor = convertFromTanStackSorting(newSorting);
          onSortingChange(sortDescriptor);
        }

        return newSorting;
      });
    },
    [onSortingChange]
  );

  const handleRowSelectionChange = useCallback(
    (updater: any) => {
      setRowSelectionState((prev) => {
        const newSelection =
          typeof updater === "function" ? updater(prev) : updater;

        if (onRowSelectionChange) {
          const selectedKeys = Object.keys(newSelection).filter(
            (key) => newSelection[key]
          );
          const selectedRows = data.filter((item, index) =>
            selectedKeys.includes(getRowKey(item, index))
          );
          onRowSelectionChange(selectedKeys, selectedRows);
        }

        return newSelection;
      });
    },
    [data, getRowKey, onRowSelectionChange]
  );

  const handleColumnOrderChange = useCallback(
    (updater: any) => {
      setColumnOrderState((prev) => {
        const newOrder =
          typeof updater === "function" ? updater(prev) : updater;

        if (onColumnOrderChange) {
          onColumnOrderChange(newOrder);
        }

        return newOrder;
      });
    },
    [onColumnOrderChange]
  );

  const handleGroupingChange = useCallback(
    (updater: any) => {
      setGroupingState((prev) => {
        const newGrouping =
          typeof updater === "function" ? updater(prev) : updater;

        if (onGroupingChange) {
          onGroupingChange(newGrouping);
        }

        return newGrouping;
      });
    },
    [onGroupingChange]
  );

  const handleExpandedChange = useCallback(
    (updater: any) => {
      setExpandedState((prev) => {
        const newExpanded =
          typeof updater === "function" ? updater(prev) : updater;

        if (onExpandedChange) {
          onExpandedChange(newExpanded);
        }

        return newExpanded;
      });
    },
    [onExpandedChange]
  );

  // Memoize state object to prevent unnecessary re-renders
  const tableState = useMemo(
    () => ({
      pagination: paginationState,
      sorting: sortingState,
      rowSelection: rowSelectionState,
      columnPinning: columnPinningState,
      columnSizing: enableColumnResizing ? columnSizingState : {},
      columnVisibility: enableColumnVisibility ? columnVisibilityState : {},
      columnOrder: enableColumnOrdering ? columnOrderState : undefined,
      grouping: enableGrouping ? groupingState : undefined,
      expanded: enableGrouping ? expandedState : undefined,
    }),
    [
      paginationState,
      sortingState,
      rowSelectionState,
      columnPinningState,
      enableColumnResizing,
      columnSizingState,
      enableColumnVisibility,
      columnVisibilityState,
      enableColumnOrdering,
      columnOrderState,
      enableGrouping,
      groupingState,
      expandedState,
    ]
  );

  // Memoize pageCount calculation
  const pageCount = useMemo(() => {
    if (pagination && typeof pagination === "object" && pagination.total) {
      return Math.ceil(pagination.total / paginationState.pageSize);
    }
    return undefined;
  }, [pagination, paginationState.pageSize]);

  // Create TanStack Table instance
  const table = useReactTable({
    data,
    columns: tanStackColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: manualPagination
      ? undefined
      : getPaginationRowModel(),
    getSortedRowModel: manualSorting ? undefined : getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getGroupedRowModel: enableGrouping ? getGroupedRowModel() : undefined,
    getExpandedRowModel: enableGrouping ? getExpandedRowModel() : undefined,

    // State
    state: tableState,

    // Pagination
    manualPagination,
    pageCount,

    // Sorting
    manualSorting,
    enableSorting,

    // Selection
    enableRowSelection: rowSelection !== false,
    getRowId: getRowKey,

    // Column features
    enableColumnResizing,
    enableColumnPinning,

    // Grouping
    enableGrouping,
    manualExpanding: false, // TODO: support manual expanding if needed

    // Handlers - use memoized callbacks
    onPaginationChange: handlePaginationChange,
    onSortingChange: handleSortingChange,
    onRowSelectionChange: handleRowSelectionChange,
    onColumnPinningChange: setColumnPinningState,
    onColumnSizingChange: setColumnSizingState,
    onColumnVisibilityChange: setColumnVisibilityState,
    onColumnOrderChange: handleColumnOrderChange,
    onGroupingChange: handleGroupingChange,
    onExpandedChange: handleExpandedChange,
  });

  // Computed values - memoize to prevent recalculation
  const rows = useMemo(() => table.getRowModel().rows, [table, data]);
  const headerGroups = useMemo(() => table.getHeaderGroups(), [table]);
  const visibleColumns = useMemo(() => table.getVisibleLeafColumns(), [table]);

  const selectedRowKeys = useMemo(() => {
    return Object.keys(rowSelectionState).filter(
      (key) => rowSelectionState[key]
    );
  }, [rowSelectionState]);

  // Optimize selectedRows calculation with Map for O(1) lookup
  const selectedRows = useMemo(() => {
    if (selectedRowKeys.length === 0) return [];

    const selectedKeySet = new Set(selectedRowKeys);
    const result: T[] = [];

    for (const row of rows) {
      if (selectedKeySet.has(row.id)) {
        result.push(row.original);
      }
    }

    return result;
  }, [rows, selectedRowKeys]);

  // Handlers
  const toggleRowSelection = useCallback((rowId: string, select?: boolean) => {
    setRowSelectionState((prev) => {
      const current = prev[rowId] ?? false;
      const next = select !== undefined ? select : !current;

      if (next === current) return prev;

      return { ...prev, [rowId]: next };
    });
  }, []);

  const toggleAllRowsSelection = useCallback(
    (select?: boolean) => {
      setRowSelectionState((prev) => {
        const allSelected = rows.every((row) => prev[row.id]);
        const next = select !== undefined ? select : !allSelected;

        const newSelection: RowSelectionState = {};
        rows.forEach((row) => {
          newSelection[row.id] = next;
        });

        return newSelection;
      });
    },
    [rows]
  );

  const resetRowSelection = useCallback(() => {
    setRowSelectionState({});
  }, []);

  return {
    table,
    paginationState,
    sortingState,
    rowSelectionState,
    columnPinningState,
    columnSizingState,
    columnVisibilityState,
    columnOrderState,
    groupingState,
    expandedState,
    rows,
    headerGroups,
    visibleColumns,
    selectedRows,
    selectedRowKeys,
    setPagination: setPaginationState,
    setSorting: setSortingState,
    setRowSelection: setRowSelectionState,
    setColumnOrder: setColumnOrderState,
    setGrouping: setGroupingState,
    setExpanded: setExpandedState,
    toggleRowSelection,
    toggleAllRowsSelection,
    resetRowSelection,
  };
}
