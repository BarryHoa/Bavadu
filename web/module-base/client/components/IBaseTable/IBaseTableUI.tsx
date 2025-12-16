"use client";

import type { SortDescriptor, TableProps } from "@heroui/table";
import type { Column, HeaderGroup, Row } from "@tanstack/react-table";
import type { ReactNode } from "react";

import { Spinner } from "@heroui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/table";
import { flexRender } from "@tanstack/react-table";
import clsx from "clsx";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { useCallback, useMemo } from "react";

export interface IBaseTableUIProps<T = any> {
  // TanStack Table data
  headerGroups: HeaderGroup<T>[];
  rows: Row<T>[];
  visibleColumns: Column<T, unknown>[];

  // UI Props
  loading?: boolean;
  emptyContent?: ReactNode;
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

  // Selection
  selectionMode?: TableProps["selectionMode"];
  selectedKeys?: TableProps["selectedKeys"];
  onSelectionChange?: TableProps["onSelectionChange"];

  // Sorting
  sortDescriptor?: SortDescriptor;
  onSortChange?: (sort: SortDescriptor) => void;

  // Column configuration
  getRowKey: (record: T, index: number) => string;
  renderCell?: (
    column: Column<T, unknown>,
    row: Row<T>,
    value: any,
  ) => ReactNode;
  renderHeader?: (
    header: HeaderGroup<T>,
    column: Column<T, unknown>,
  ) => ReactNode;
}

// Memoize sort icons to prevent recreation
const sortIcons = {
  default: <ChevronsUpDown aria-hidden className="h-3.5 w-3.5 opacity-70" />,
  ascending: <ChevronUp aria-hidden className="h-3.5 w-3.5 opacity-90" />,
  descending: <ChevronDown aria-hidden className="h-3.5 w-3.5 opacity-90" />,
} as const;

export default function IBaseTableUI<T = any>({
  headerGroups,
  rows,
  visibleColumns,
  loading = false,
  emptyContent = "No data available",
  classNames = {},
  tableLayout = "auto",
  color = "primary",
  isStriped = true,
  isCompact = true,
  isHeaderSticky = true,
  selectionMode,
  selectedKeys,
  onSelectionChange,
  sortDescriptor,
  onSortChange,
  getRowKey,
  renderCell,
  renderHeader,
}: IBaseTableUIProps<T>) {
  // Memoize sort icon getter
  const getSortIcon = useCallback(
    (columnId: string) => {
      if (!sortDescriptor || sortDescriptor.column !== columnId) {
        return sortIcons.default;
      }

      return sortDescriptor.direction === "ascending"
        ? sortIcons.ascending
        : sortIcons.descending;
    },
    [sortDescriptor],
  );

  // Memoize header click handler
  const handleHeaderClick = useCallback(
    (column: Column<T, unknown>) => {
      if (!column.getCanSort() || !onSortChange) return;

      const columnId = column.id;
      const isSameColumn = sortDescriptor?.column === columnId;
      const nextDirection =
        !isSameColumn || sortDescriptor?.direction === "descending"
          ? "ascending"
          : "descending";

      onSortChange({
        column: columnId,
        direction: nextDirection,
      });
    },
    [sortDescriptor, onSortChange],
  );

  // Memoize classNames to prevent object recreation
  const memoizedClassNames = useMemo(
    () => ({
      ...classNames,
      tbody: clsx("overflow-x-auto", classNames.tbody),
      wrapper: clsx("rounded-none p-0", classNames.wrapper),
      th: clsx(
        "px-0 bg-primary-600 text-white hover:bg-primary-700/80",
        classNames.th,
      ),
      tr: clsx("hover:bg-primary-700/10", classNames.tr),
      td: clsx("rounded-none py-1 px-2", classNames.td),
    }),
    [classNames],
  );

  // Create column lookup map for O(1) access - memoize to prevent recreation
  const columnMap = useMemo(
    () => new Map(visibleColumns.map((col) => [col.id, col])),
    [visibleColumns],
  );

  return (
    <Table
      aria-label="Data table"
      classNames={memoizedClassNames}
      color={color}
      isCompact={isCompact}
      isHeaderSticky={isHeaderSticky}
      isStriped={isStriped}
      layout={tableLayout}
      selectedKeys={selectedKeys}
      selectionMode={selectionMode}
      onSelectionChange={onSelectionChange}
    >
      <TableHeader>
        {headerGroups.flatMap((headerGroup) =>
          headerGroup.headers.map((header) => {
            const column = columnMap.get(header.id);
            const meta = (column?.columnDef?.meta as Record<string, any>) || {};
            const isSortable = header.column.getCanSort();
            const isPinned = header.column.getIsPinned();
            const pinStyle = isPinned
              ? {
                  position: "sticky" as const,
                  [isPinned === "left" ? "left" : "right"]:
                    header.column.getStart(isPinned),
                  zIndex: 10,
                }
              : undefined;

            return (
              <TableColumn
                key={header.id}
                align={meta.align || "start"}
                allowsSorting={false}
                className={clsx(
                  isPinned && "frozen-column",
                  isPinned === "left" && "frozen-left",
                  isPinned === "right" && "frozen-right",
                )}
                maxWidth={column?.columnDef.maxSize}
                minWidth={column?.columnDef.minSize}
                style={pinStyle}
                width={column?.getSize()}
              >
                {renderHeader ? (
                  renderHeader(headerGroup, column!)
                ) : (
                  <div
                    className={clsx(
                      "inline-flex h-full w-full items-center",
                      isSortable && "cursor-pointer select-none",
                    )}
                    role={isSortable ? "button" : undefined}
                    tabIndex={isSortable ? 0 : -1}
                    onClick={() => handleHeaderClick(header.column)}
                  >
                    <span
                      className={clsx(
                        "inline-flex w-full items-center px-2",
                        meta.align === "end"
                          ? "justify-end"
                          : meta.align === "center"
                            ? "justify-center"
                            : "justify-start",
                      )}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      {isSortable && (
                        <span className="ml-2 inline-flex items-center justify-end">
                          {getSortIcon(header.id)}
                        </span>
                      )}
                    </span>
                  </div>
                )}
              </TableColumn>
            );
          }),
        )}
      </TableHeader>
      <TableBody
        emptyContent={emptyContent}
        isLoading={loading}
        items={useMemo(
          () =>
            rows.map((row) => ({
              row,
              original: row.original,
              index: row.index,
            })),
          [rows],
        )}
        loadingContent={<Spinner label="Loading..." />}
      >
        {({
          row,
          original,
          index,
        }: {
          row: Row<T>;
          original: T;
          index: number;
        }) => {
          const rowKey = getRowKey(original, index);

          return (
            <TableRow key={rowKey}>
              {row.getVisibleCells().map((cell) => {
                const column = columnMap.get(cell.column.id);
                const meta =
                  (column?.columnDef?.meta as Record<string, any>) || {};
                const isPinned = cell.column.getIsPinned();
                const pinStyle = isPinned
                  ? {
                      position: "sticky" as const,
                      [isPinned === "left" ? "left" : "right"]:
                        cell.column.getStart(isPinned),
                      zIndex: 10,
                    }
                  : undefined;

                return (
                  <TableCell
                    key={cell.id}
                    className={clsx(
                      isPinned && "frozen-column",
                      isPinned === "left" && "frozen-left",
                      isPinned === "right" && "frozen-right",
                    )}
                    style={pinStyle}
                  >
                    <div
                      className={clsx(
                        "flex",
                        `justify-${meta.align || "start"}`,
                      )}
                    >
                      {renderCell
                        ? (() => {
                            const customRender = renderCell(
                              column!,
                              row,
                              cell.getValue(),
                            );

                            return customRender !== null &&
                              customRender !== undefined
                              ? customRender
                              : flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext(),
                                );
                          })()
                        : flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                    </div>
                  </TableCell>
                );
              })}
            </TableRow>
          );
        }}
      </TableBody>
    </Table>
  );
}
