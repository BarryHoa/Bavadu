"use client";
import type { SortDescriptor } from "@react-types/shared";
import type { ReactNode } from "react";

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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { PAGINATION_DEFAULT_PAGE_SIZE } from "../Pagination/paginationConsts";

// Column Definition Type (compatible with IBaseTableColumnDefinition); supports group via children
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
  /** Nested columns (group). Leaf columns have no children. */
  children?: IBaseTableCoreColumn<T>[];
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
          selectedRows: T[],
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

  onRowSelectionChange?: (
    selectedRowKeys: (string | number)[],
    selectedRows: T[],
  ) => void;
  onColumnOrderChange?: (columnOrder: string[]) => void;

  // DataTable specific: Combined onChange callback
  onChangeTable?: (params: {
    page: number;
    pageSize: number;
    sort?: SortDescriptor;
  }) => void;
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
  setRowSelection: (
    selection:
      | RowSelectionState
      | ((prev: RowSelectionState) => RowSelectionState),
  ) => void;
  setColumnOrder: (
    updater: ColumnOrderState | ((prev: ColumnOrderState) => ColumnOrderState),
  ) => void;
  setGrouping: (grouping: GroupingState) => void;
  setExpanded: (expanded: ExpandedState) => void;
  toggleRowSelection: (rowId: string, select?: boolean) => void;
  toggleAllRowsSelection: (select?: boolean) => void;
  resetRowSelection: () => void;
  // Pagination info (1-based for UI)
  paginationInfo?: {
    currentPage: number;
    pageSize: number;
    pages: number;
    from: number;
    to: number;
    total: number;
  };
  // Row key function
  getRowKey: (record: T, index: number) => string;
  // Sort descriptor for UI
  sortDescriptor?: SortDescriptor;
  // Page change handlers (for pagination UI)
  handlePageChange?: (nextPage: number) => void;
  handlePageSizeChange?: (nextPageSize: number) => void;
  handleSortChange?: (sort: SortDescriptor) => void;
}

// Convert column definition to TanStack format (supports nested group columns)
function convertToTanStackColumn<T>(
  column: IBaseTableCoreColumn<T>,
): ColumnDef<T> {
  const hasChildren =
    Array.isArray(column.children) && column.children.length > 0;

  if (hasChildren && column.children) {
    return {
      id: column.key,
      header: () => column.title ?? column.label ?? column.key,
      columns: column.children.map((child) => convertToTanStackColumn(child)),
    };
  }

  // TanStack needs accessorKey or accessorFn for getValue() to work; without it cell value is never read.
  const accessorKey =
    typeof column.dataIndex === "string" ? column.dataIndex : column.key;

  const headerValue = column.title || column.label || column.key;
  const headerFn =
    typeof headerValue === "string" || typeof headerValue === "number"
      ? () => String(headerValue)
      : () => headerValue;

  const columnDef: ColumnDef<T> = {
    id: column.key,
    accessorKey,
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

/** Flatten column tree to leaf keys (for column order / pinning). */
function getLeafColumnKeys<T>(columns: IBaseTableCoreColumn<T>[]): string[] {
  const keys: string[] = [];
  for (const col of columns) {
    if (Array.isArray(col.children) && col.children.length > 0) {
      keys.push(...getLeafColumnKeys(col.children));
    } else {
      keys.push(col.key);
    }
  }
  return keys;
}

function getLeafColumnPinning<T>(
  columns: IBaseTableCoreColumn<T>[],
): ColumnPinningState {
  const left: string[] = [];
  const right: string[] = [];
  const visit = (cols: IBaseTableCoreColumn<T>[]) => {
    for (const col of cols) {
      if (Array.isArray(col.children) && col.children.length > 0) {
        visit(col.children);
      } else {
        if (col.fixed === "left") left.push(col.key);
        else if (col.fixed === "right") right.push(col.key);
      }
    }
  };
  visit(columns);
  return { left, right };
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
  sorting: SortingState,
): SortDescriptor | undefined {
  if (sorting.length === 0) return undefined;

  const firstSort = sorting[0];

  return {
    column: firstSort.id,
    direction: firstSort.desc ? "descending" : "ascending",
  };
}

export function useIBaseTableCore<T = any>(
  props: IBaseTableCoreProps<T>,
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
    onRowSelectionChange,
    onColumnOrderChange,
    onChangeTable,
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
    [rowKey],
  );

  // Convert columns to TanStack format - memoize with stable reference
  const tanStackColumns = useMemo<ColumnDef<T>[]>(() => {
    return columns.map((col) => convertToTanStackColumn(col));
  }, [columns]);

  // Memoize leaf column keys for columnOrderState (flatten tree)
  const columnKeys = useMemo(() => getLeafColumnKeys(columns), [columns]);

  const initialColumnPinning = useMemo(
    () => getLeafColumnPinning(columns),
    [columns],
  );

  // Pagination state
  const [paginationState, setPaginationState] = useState<PaginationState>(
    () => {
      if (pagination === false) {
        return { pageIndex: 0, pageSize: PAGINATION_DEFAULT_PAGE_SIZE };
      }

      return {
        pageIndex: (pagination?.page ?? 1) - 1, // TanStack uses 0-based index
        pageSize: pagination?.pageSize ?? PAGINATION_DEFAULT_PAGE_SIZE,
      };
    },
  );

  // Sorting state
  const [sortingState, setSortingState] = useState<SortingState>(() =>
    convertToTanStackSorting(sorting),
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
    },
  );

  // Column pinning state (for frozen columns)
  const [columnPinningState, setColumnPinningState] =
    useState<ColumnPinningState>(() => initialColumnPinning);

  // Khi cấu hình cột thay đổi (ví dụ: từ cột placeholder sang cột thật),
  // đồng bộ lại trạng thái pinning theo fixed của column.
  useEffect(() => {
    setColumnPinningState(initialColumnPinning);
  }, [initialColumnPinning]);

  // Column sizing state
  const [columnSizingState, setColumnSizingState] = useState<ColumnSizingState>(
    {},
  );

  // Column visibility state
  const [columnVisibilityState, setColumnVisibilityState] =
    useState<VisibilityState>({});

  // Column ordering state (for drag & drop) - sync with column keys changes
  const [columnOrderState, setColumnOrderState] = useState<ColumnOrderState>(
    () => columnKeys,
  );

  // Derive effective column order in the same render so table never sees stale ids.
  // Ensures column count always matches columnKeys (fixes "14 cells and 1 columns" when switching from 14 to 1 column).
  const effectiveColumnOrder = useMemo<ColumnOrderState>(() => {
    const keysSet = new Set(columnKeys);
    const result: string[] = [];
    columnOrderState.forEach((id) => {
      if (keysSet.has(id)) result.push(id);
    });
    columnKeys.forEach((id) => {
      if (!result.includes(id)) result.push(id);
    });
    return result.length > 0 ? result : columnKeys;
  }, [columnKeys, columnOrderState]);

  // Sync column order state when column keys change (for next render)
  useEffect(() => {
    setColumnOrderState((prev) => {
      const newKeys = new Set(columnKeys);
      if (
        prev.length !== columnKeys.length ||
        !columnKeys.every((k) => prev.includes(k)) ||
        !prev.every((k) => newKeys.has(k))
      ) {
        const merged: string[] = [];
        prev.forEach((key) => {
          if (newKeys.has(key)) merged.push(key);
        });
        columnKeys.forEach((key) => {
          if (!merged.includes(key)) merged.push(key);
        });
        return merged.length > 0 ? merged : columnKeys;
      }
      return prev;
    });
  }, [columnKeys]);

  // Grouping state
  const [groupingState, setGroupingState] = useState<GroupingState>(
    () => grouping || [],
  );

  // Expanded state (for grouped rows)
  const [expandedState, setExpandedState] = useState<ExpandedState>(
    () => expanded || {},
  );

  // Sync external sorting changes - memoize conversion
  const externalSortingState = useMemo(
    () => (sorting !== undefined ? convertToTanStackSorting(sorting) : null),
    [sorting],
  );

  useEffect(() => {
    if (externalSortingState !== null) {
      setSortingState((prev) => {
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

  const sortDescriptorRef = useRef<SortDescriptor | undefined>(
    convertFromTanStackSorting(
      sorting !== undefined ? convertToTanStackSorting(sorting) : [],
    ),
  );
  useEffect(() => {
    sortDescriptorRef.current = convertFromTanStackSorting(sortingState);
  }, [sortingState]);

  const handlePaginationChange = useCallback(
    (newPagination: PaginationState) => {
      const page = newPagination.pageIndex + 1;
      const pageSize = newPagination.pageSize;
      if (onChangeTable) {
        onChangeTable({
          page,
          pageSize,
          sort: sortDescriptorRef.current ?? undefined,
        });
      }
      setPaginationState({
        pageIndex: newPagination.pageIndex,
        pageSize: newPagination.pageSize,
      });
    },
    [onChangeTable],
  );

  const handleSortingChange = useCallback(
    (updaterOrValue: React.SetStateAction<SortingState>) => {
      setSortingState((prev) => {
        const newSorting =
          typeof updaterOrValue === "function"
            ? (updaterOrValue as (prev: SortingState) => SortingState)(prev)
            : updaterOrValue;
        const sortDescriptor = convertFromTanStackSorting(newSorting);
        if (onChangeTable) {
          onChangeTable({
            page: 1,
            pageSize: paginationState.pageSize,
            sort: sortDescriptor ?? undefined,
          });
        }
        return newSorting;
      });
    },
    [onChangeTable, paginationState.pageSize],
  );

  const handleRowSelectionChange = useCallback(
    (updater: any) => {
      setRowSelectionState((prev) => {
        const newSelection =
          typeof updater === "function" ? updater(prev) : updater;

        if (onRowSelectionChange) {
          const selectedKeys = Object.keys(newSelection).filter(
            (key) => newSelection[key],
          );
          const selectedRows = data.filter((item, index) =>
            selectedKeys.includes(getRowKey(item, index)),
          );

          onRowSelectionChange(selectedKeys, selectedRows);
        }

        return newSelection;
      });
    },
    [data, getRowKey, onRowSelectionChange],
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
    [onColumnOrderChange],
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
    [onGroupingChange],
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
    [onExpandedChange],
  );

  const tableState = useMemo(
    () => ({
      rowSelection: rowSelectionState,
      columnPinning: columnPinningState,
      columnSizing: enableColumnResizing ? columnSizingState : {},
      columnVisibility: enableColumnVisibility ? columnVisibilityState : {},
      columnOrder: enableColumnOrdering ? effectiveColumnOrder : undefined,
      grouping: enableGrouping ? groupingState : undefined,
      expanded: enableGrouping ? expandedState : undefined,
    }),
    [
      rowSelectionState,
      columnPinningState,
      enableColumnResizing,
      columnSizingState,
      enableColumnVisibility,
      columnVisibilityState,
      enableColumnOrdering,
      effectiveColumnOrder,
      enableGrouping,
      groupingState,
      expandedState,
    ],
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
    columnResizeMode: "onChange",
    defaultColumn: enableColumnResizing
      ? { size: 150, minSize: 40, maxSize: 800 }
      : undefined,
    enableColumnPinning,

    // Grouping
    enableGrouping,
    manualExpanding: false, // TODO: support manual expanding if needed

    // Handlers - use memoized callbacks
    // Enable onPaginationChange for manual pagination to allow internal state updates
    // onPaginationChange: handlePaginationChange,
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
  const rows = table.getRowModel().rows;
  const headerGroups = useMemo(
    () => table.getHeaderGroups(),
    [table, effectiveColumnOrder, columnSizingState],
  );
  const visibleColumns = useMemo(
    () => table.getVisibleLeafColumns(),
    [table, effectiveColumnOrder, columnSizingState],
  );

  const selectedRowKeys = useMemo(() => {
    return Object.keys(rowSelectionState).filter(
      (key) => rowSelectionState[key],
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
    [rows],
  );

  const resetRowSelection = useCallback(() => {
    setRowSelectionState({});
  }, []);

  // Pagination info for UI (1-based)
  const paginationInfo = useMemo(() => {
    if (!pagination || typeof pagination !== "object") return undefined;

    const currentPage = paginationState.pageIndex + 1;
    const pageSize = paginationState.pageSize;
    const total = pagination.total ?? 0;
    const pages = Math.max(1, Math.ceil(total / pageSize));
    const from = total === 0 ? 0 : paginationState.pageIndex * pageSize;
    const to = total === 0 ? 0 : Math.min(total, from + pageSize);

    return {
      currentPage,
      pageSize,
      pages,
      from,
      to,
      total,
    };
  }, [pagination, paginationState]);

  // Sort descriptor for UI
  const sortDescriptor = useMemo<SortDescriptor | undefined>(() => {
    return convertFromTanStackSorting(sortingState);
  }, [sortingState]);

  // Handle page change (for pagination UI components)
  const handlePageChange = useCallback(
    (nextPage: number) => {
      if (!pagination || typeof pagination !== "object") return;

      const pages = paginationInfo?.pages ?? 1;
      const adjustedPage = Math.min(Math.max(1, nextPage), pages);

      handlePaginationChange({
        pageIndex: adjustedPage - 1,
        pageSize: paginationState.pageSize,
      });
    },
    [
      pagination,
      paginationInfo,
      paginationState.pageSize,
      handlePaginationChange,
    ],
  );

  // Handle page size change
  const handlePageSizeChange = useCallback(
    (nextPageSize: number) => {
      if (!pagination || typeof pagination !== "object") return;

      handlePaginationChange({
        pageIndex: 0,
        pageSize: nextPageSize,
      });
    },
    [pagination, handlePaginationChange],
  );

  // Handle sort change (for UI components)
  const handleSortChange = useCallback(
    (sort: SortDescriptor) => {
      handleSortingChange([
        {
          id: String(sort.column),
          desc: sort.direction === "descending",
        },
      ]);
    },
    [handleSortingChange],
  );

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
    paginationInfo,
    getRowKey,
    sortDescriptor,
    setRowSelection: setRowSelectionState,
    setColumnOrder: handleColumnOrderChange,
    setGrouping: handleGroupingChange,
    setExpanded: handleExpandedChange,
    toggleRowSelection,
    toggleAllRowsSelection,
    resetRowSelection,
    handlePageChange,
    handlePageSizeChange,
    handleSortChange,
  };
}
