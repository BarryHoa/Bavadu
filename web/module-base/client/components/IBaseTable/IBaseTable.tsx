"use client";

import type { Selection, SortDescriptor, TableProps } from "@heroui/table";
import clsx from "clsx";
import { useCallback, useMemo } from "react";
import {
  useIBaseTableCore,
  type IBaseTableCoreColumn,
  type IBaseTableCoreProps,
} from "./IBaseTableCore";
import IBaseTableUI from "./IBaseTableUI";

export interface IBaseTableProps<T = any>
  extends Omit<IBaseTableCoreProps<T>, "columns"> {
  columns: IBaseTableCoreColumn<T>[];
  // UI Props
  loading?: boolean;
  emptyContent?: React.ReactNode;
  classNames?: {
    wrapper?: string;
    table?: string;
    thead?: string;
    tbody?: string;
    tr?: string;
    th?: string;
    td?: string;
  };
  tableLayout?: "auto" | "fixed";
  color?: TableProps["color"];
  isStriped?: boolean;
  isCompact?: boolean;
  isHeaderSticky?: boolean;
  // Additional props
  "aria-label"?: string;
}

export default function IBaseTable<T = any>(props: IBaseTableProps<T>) {
  const {
    columns,
    data,
    loading = false,
    emptyContent = "No data available",
    classNames = {},
    tableLayout = "auto",
    color = "primary",
    isStriped = true,
    isCompact = true,
    isHeaderSticky = true,
    rowKey = "id",
    pagination,
    sorting,
    rowSelection,
    enableColumnResizing = true,
    enableColumnPinning = true,
    enableColumnVisibility = false,
    enableColumnOrdering = false,
    enableGrouping = false,
    grouping,
    onGroupingChange,
    expanded,
    onExpandedChange,
    onColumnOrderChange,
    manualPagination = false,
    manualSorting = false,
    onPaginationChange,
    onSortingChange,
    onRowSelectionChange,
    ...rest
  } = props;

  // Core logic
  const core = useIBaseTableCore<T>({
    data,
    columns,
    rowKey,
    pagination,
    manualPagination,
    sorting,
    manualSorting,
    rowSelection,
    enableColumnResizing,
    enableColumnPinning,
    enableColumnVisibility,
    enableColumnOrdering,
    enableGrouping,
    grouping,
    onGroupingChange,
    expanded,
    onExpandedChange,
    onColumnOrderChange,
    onPaginationChange,
    onSortingChange,
    onRowSelectionChange,
  });

  // Get row key function
  const getRowKey = useMemo(() => {
    if (typeof rowKey === "function") {
      return rowKey;
    }
    return (record: T, index: number): string => {
      const key = (record as any)[rowKey];
      return key !== undefined && key !== null ? String(key) : String(index);
    };
  }, [rowKey]);

  // Memoize selection change handler
  const handleSelectionChange = useCallback(
    (keys: Selection) => {
      if (rowSelection === false) return;

      if (keys === "all") {
        core.toggleAllRowsSelection(true);
      } else if (keys instanceof Set) {
        // Update selection based on HeroUI Selection
        const newSelection: Record<string, boolean> = {};
        keys.forEach((key) => {
          newSelection[String(key)] = true;
        });
        core.setRowSelection(newSelection);
      } else {
        core.resetRowSelection();
      }
    },
    [rowSelection, core]
  );

  // Convert row selection state to HeroUI format
  const selectionProps = useMemo(() => {
    if (rowSelection === false) {
      return undefined;
    }

    if (!rowSelection) {
      return undefined;
    }

    const selectedKeysSet = new Set(core.selectedRowKeys);

    return {
      selectionMode: (rowSelection.type === "single"
        ? "single"
        : "multiple") as TableProps["selectionMode"],
      selectedKeys: selectedKeysSet.size > 0 ? selectedKeysSet : undefined,
      onSelectionChange: handleSelectionChange,
    };
  }, [rowSelection, core.selectedRowKeys, handleSelectionChange]);

  // Convert sorting state to SortDescriptor
  const sortDescriptor = useMemo<SortDescriptor | undefined>(() => {
    if (core.sortingState.length === 0) return undefined;

    const firstSort = core.sortingState[0];
    return {
      column: String(firstSort.id),
      direction: firstSort.desc ? "descending" : "ascending",
    };
  }, [core.sortingState]);

  const handleSortChange = useCallback(
    (sort: SortDescriptor) => {
      core.setSorting([
        {
          id: String(sort.column),
          desc: sort.direction === "descending",
        },
      ]);

      if (onSortingChange) {
        onSortingChange(sort);
      }
    },
    [core, onSortingChange]
  );

  return (
    <div className={clsx("w-full bg-content1", classNames.wrapper)}>
      <IBaseTableUI
        headerGroups={core.headerGroups}
        rows={core.rows}
        visibleColumns={core.visibleColumns}
        loading={loading}
        emptyContent={emptyContent}
        classNames={classNames}
        tableLayout={tableLayout}
        color={color}
        isStriped={isStriped}
        isCompact={isCompact}
        isHeaderSticky={isHeaderSticky}
        selectionMode={selectionProps?.selectionMode}
        selectedKeys={selectionProps?.selectedKeys}
        onSelectionChange={selectionProps?.onSelectionChange}
        sortDescriptor={sortDescriptor}
        onSortChange={handleSortChange}
        getRowKey={getRowKey}
        {...rest}
      />
    </div>
  );
}
