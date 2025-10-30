"use client";

 import { useMemo, useState, useCallback } from "react";
 import type { ReactNode } from "react";
import { Spinner } from "@heroui/spinner";
import { TableProps } from "@heroui/table";

 import {
   Table,
   TableHeader,
   TableBody,
   TableColumn,
   TableRow,
   TableCell,
 } from "@base/components/base/Table";
 import usePagination from "@base/components/base/Pagination/usePagination";
 import {
   PAGINATION_DEFAULT_PAGE_SIZE,
   PAGINATION_PAGE_SIZE_OPTIONS,
 } from "@base/components/base/Pagination/pagginationConts";
 import PaginationComponent from "@base/components/base/Pagination/Pagination";

export interface DataTableColumn<T = any> {
  key: string;
  label: string;
  align?: "start" | "center" | "end";
  width?: number;
  sortable?: boolean;
   render?: (value: any, record: T, index: number) => ReactNode;
  fixed?: "left" | "right"; // Freeze column to left or right
}

export interface DataTableSummary {
  label?: string;
   values: Record<string, ReactNode>;
}

export type DataTableProps<T = any> = TableProps & {
  columns: DataTableColumn<T>[];
  dataSource: T[];
  rowKey?: string;

  // Pagination
  pagination?:
    | {
        pageSize?: number;
        pageSizeOptions?: number[];
        page?: number;
        total?: number;
        showTotal?: boolean;
      }
    | false;

  // Table features
  loading?: boolean;

  // Summary
  summary?: DataTableSummary;

  // Selection
  selectedKeys?: Set<string | number>;
  onSelectionChange?: (keys: Set<string | number>) => void;

  // Events
  onChangeTable?: (params: {
    page: number;
    pageSize: number;
    sortColumn?: string;
    sortDirection?: "ascending" | "descending";
  }) => void;

  // Styling
  className?: string;
  classNames?: {
    wrapper?: string;
    table?: string;
    thead?: string;
    tbody?: string;
    tr?: string;
    th?: string;
    td?: string;
    footer?: string;
    pagination?: string;
    selectedRow?: string; // Custom class for selected rows
  };

  // Custom empty state
   emptyContent?: ReactNode;
};

export default function DataTable<T = any>({
  columns,
  dataSource,
  rowKey = "id",
  pagination = { pageSize: PAGINATION_DEFAULT_PAGE_SIZE, page: 1 },
  loading = false,
  color = "primary",
  summary,
  selectedKeys,
  onSelectionChange,
  onChangeTable,
  className = "",
  classNames = {},
  emptyContent = "No data available",
  ...rest
 }: DataTableProps<T>) {
  const isPagination = pagination && typeof pagination === "object";

  const paginationInfo = usePagination({
    pageSizeOptions: isPagination
      ? pagination?.pageSizeOptions
      : PAGINATION_PAGE_SIZE_OPTIONS,
    defaultPageSize: isPagination
      ? pagination?.pageSize
      : PAGINATION_DEFAULT_PAGE_SIZE,
    defaultPage: isPagination ? pagination?.page : 1,
    total: isPagination ? pagination?.total || 0 : 0,
  });

  // const [currentPage, setCurrentPage] = useState(currentPage);
  const [sortDescriptor, setSortDescriptor] = useState<{
    column?: string;
    direction?: "ascending" | "descending";
  }>({});

  // Get current page data

  const isExistRowKey = useMemo(() => {
    return (
      typeof rowKey === "string" && rowKey in ((dataSource?.[0] as any) ?? {})
    );
  }, [rowKey, dataSource]);

  // Get row key
  const getRowKey = useCallback(
    (record: T, index: number) => {
      if (isExistRowKey) {
        const val = (record as any)[rowKey];

        if (typeof val === "string" || typeof val === "number") {
          return String(val);
        }
      }

      return index;
    },
    [rowKey, isExistRowKey],
  );

  // Handle page change
  const handlePageChange = useCallback(
    (page: number) => {
      const newPage = paginationInfo.handleChangePage(page);

      if (onChangeTable) {
        onChangeTable({
          page: newPage,
          pageSize: paginationInfo.pageSize,
          sortColumn: sortDescriptor.column,
          sortDirection: sortDescriptor.direction,
        });
      }
    },
    [paginationInfo, sortDescriptor, onChangeTable],
  );

  // Handle page size change
  const handlePageSizeChange = useCallback(
    (pageSize: number) => {
      const newPageSize = paginationInfo.handleChangePageSize(pageSize);

      if (onChangeTable) {
        onChangeTable({
          page: paginationInfo.currentPage,
          pageSize: newPageSize,
          sortColumn: sortDescriptor.column,
          sortDirection: sortDescriptor.direction,
        });
      }
    },
    [paginationInfo, sortDescriptor, onChangeTable],
  );

  // Calculate frozen column positions
  const frozenColumnsInfo = useMemo(() => {
    const leftColumns: Array<{ key: string; left: number; width: number }> = [];
    const rightColumns: Array<{ key: string; right: number; width: number }> =
      [];
    let leftOffset = 0;
    let rightOffset = 0;

    // Calculate left frozen columns
    columns.forEach((col) => {
      if (col.fixed === "left") {
        leftColumns.push({
          key: col.key,
          left: leftOffset,
          width: col.width || 150,
        });
        leftOffset += col.width || 150;
      }
    });

    // Calculate right frozen columns (from right to left)
    for (let i = columns.length - 1; i >= 0; i--) {
      const col = columns[i];

      if (col.fixed === "right") {
        rightColumns.unshift({
          key: col.key,
          right: rightOffset,
          width: col.width || 150,
        });
        rightOffset += col.width || 150;
      }
    }

    return { leftColumns, rightColumns };
  }, [columns]);

  // Get frozen column style
  const getFrozenStyle = useCallback(
    (columnKey: string) => {
      const leftCol = frozenColumnsInfo.leftColumns.find(
        (c) => c.key === columnKey,
      );

      if (leftCol) {
        return {
          position: "sticky" as const,
          left: leftCol.left,
          zIndex: 10,
        };
      }

      const rightCol = frozenColumnsInfo.rightColumns.find(
        (c) => c.key === columnKey,
      );

      if (rightCol) {
        return {
          position: "sticky" as const,
          right: rightCol.right,
          zIndex: 10,
        };
      }

      return {};
    },
    [frozenColumnsInfo],
  );

  // Get frozen column class
  const getFrozenClass = useCallback(
    (columnKey: string) => {
      const isLeftFrozen = frozenColumnsInfo.leftColumns.some(
        (c) => c.key === columnKey,
      );
      const isRightFrozen = frozenColumnsInfo.rightColumns.some(
        (c) => c.key === columnKey,
      );

      if (isLeftFrozen) return "frozen-column frozen-left";
      if (isRightFrozen) return "frozen-column frozen-right";

      return "";
    },
    [frozenColumnsInfo],
  );

  // Render cell content
  const renderCell = useCallback(
    (record: T, column: DataTableColumn<T>, index: number) => {
      const value = (record as any)[column.key];

      if (column.render) {
        return column.render(value, record, index);
      }

      return value;
    },
    [],
  );

  // Table bottom content (pagination + summary)

  // Get selection color class

  return (
    <div className={`w-full bg-content1 ${classNames.wrapper || ""}`}>
      <div className="flex flex-col gap-4 flex-1">
        <Table
          aria-label="Data table"
          selectedKeys={selectedKeys}
          selectionMode="multiple"
          isHeaderSticky
          // isStriped
          isCompact
          onSelectionChange={onSelectionChange as any}
          // bottomContent={bottomContent}
          className={className}
          classNames={{
            ...classNames,
            tbody: "overflow-x-auto",
            wrapper: "p-2 rounded-none",
            th: "bg-primary-700 text-white ",
          }}
          // color={"success"}
          {...rest}
        >
          <TableHeader>
            {columns.map((column) => (
              <TableColumn
                key={column.key}
                align={column.align || "start"}
                allowsSorting={column.sortable}
                className={getFrozenClass(column.key)}
                style={getFrozenStyle(column.key)}
                width={column.width}
              >
                {column.label}
              </TableColumn>
            ))}
          </TableHeader>
          <TableBody
            emptyContent={emptyContent}
            isLoading={loading}
            items={dataSource}
            loadingContent={<Spinner label="Loading..." />}
          >
            {(item) => {
              const index = dataSource.indexOf(item);

              return (
                <TableRow key={getRowKey(item, index)}>
                  {columns.map((column) => (
                    <TableCell
                      key={column.key}
                      className={getFrozenClass(column.key)}
                      style={getFrozenStyle(column.key)}
                    >
                      {renderCell(item, column, index)}
                    </TableCell>
                  ))}
                </TableRow>
              );
            }}
          </TableBody>
        </Table>
      </div>
      {isPagination && paginationInfo.pages > 1 && (
        <div
          className={`px-2 flex flex-col sm:flex-row justify-between items-center ${classNames.pagination || ""}`}
        >
          <div className="text-small text-default-500 py-2">
            {isPagination && pagination.showTotal && (
              <span>
                Showing{" "}
                {(paginationInfo.from + 1) * paginationInfo.pageSize + 1} to{" "}
                {paginationInfo.to}
                of {pagination.total} entries
              </span>
            )}
          </div>
          <PaginationComponent
            page={paginationInfo.currentPage}
            pageSize={paginationInfo.pageSize}
            total={paginationInfo.pages}
            onChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
      )}
    </div>
  );
}
