"use client";

import { useMemo, useState, useCallback } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "../Table";
import { Pagination } from "@heroui/pagination";
import { Spinner } from "@heroui/spinner";
import usePagination from "./usePagination";
import {
  PAGINATION_DEFAULT_PAGE_SIZE,
  PAGINATION_PAGE_SIZE_OPTIONS,
} from "./dataTableConst";

export interface DataTableColumn<T = any> {
  key: string;
  label: string;
  align?: "start" | "center" | "end";
  width?: number;
  sortable?: boolean;
  render?: (value: any, record: T, index: number) => React.ReactNode;
}

export interface DataTableSummary {
  label?: string;
  values: Record<string, React.ReactNode>;
}

export interface DataTableProps<T = any> {
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
  sticky?: boolean;
  striped?: boolean;
  bordered?: boolean;
  hoverable?: boolean;
  compact?: boolean;

  // Theme
  color?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger";

  // Summary
  summary?: DataTableSummary;

  // Selection
  selectable?: boolean;
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
  };

  // Custom empty state
  emptyContent?: React.ReactNode;
}

export default function DataTable<T = any>({
  columns,
  dataSource,
  rowKey = "id",
  pagination = { pageSize: PAGINATION_DEFAULT_PAGE_SIZE, page: 1 },
  loading = false,
  sticky = true,
  striped = true,
  bordered = false,
  hoverable = true,
  compact = true,
  color = "primary",
  summary,
  selectable = false,
  selectedKeys,
  onSelectionChange,
  onChangeTable,
  className = "",
  classNames = {},
  emptyContent = "No data available",
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
    [rowKey, isExistRowKey]
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
    [paginationInfo, sortDescriptor, onChangeTable]
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
    [paginationInfo, sortDescriptor, onChangeTable]
  );

  // Get theme colors based on color prop

  // Render cell content
  const renderCell = useCallback(
    (record: T, column: DataTableColumn<T>, index: number) => {
      const value = (record as any)[column.key];

      if (column.render) {
        return column.render(value, record, index);
      }

      return value;
    },
    []
  );

  // Table bottom content (pagination + summary)
  const bottomContent = useMemo(() => {
    if (!pagination && !summary) return null;

    return (
      <div className="flex flex-col gap-4">
        {/* Summary Row */}
        {summary && (
          <div
            className={`bg-default-100 rounded-lg p-4 ${classNames.footer || ""}`}
          >
            <div
              className="grid gap-2"
              style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}
            >
              {columns.map((column, index) => (
                <div
                  key={column.key}
                  className={`px-3 py-2 ${
                    column.align === "center"
                      ? "text-center"
                      : column.align === "end"
                        ? "text-right"
                        : "text-left"
                  } ${index === 0 ? "font-semibold" : ""}`}
                >
                  {index === 0 && summary.label ? (
                    <span className="text-sm font-semibold">
                      {summary.label}
                    </span>
                  ) : summary.values[column.key] ? (
                    summary.values[column.key]
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pagination */}
        {isPagination && paginationInfo.pages > 1 && (
          <div
            className={`flex justify-between items-center ${classNames.pagination || ""}`}
          >
            <div className="text-small text-default-500">
              {isPagination && pagination.showTotal && (
                <span>
                  Showing{" "}
                  {(paginationInfo.from + 1) * paginationInfo.pageSize + 1} to{" "}
                  {paginationInfo.to}
                  of {pagination.total} entries
                </span>
              )}
            </div>
            <Pagination
              isCompact
              showControls
              showShadow
              color="primary"
              page={paginationInfo.currentPage}
              total={paginationInfo.pages}
              onChange={handlePageChange}
            />
          </div>
        )}
      </div>
    );
  }, [
    pagination,
    summary,
    columns,
    paginationInfo,
    dataSource.length,
    handlePageChange,
    classNames,
  ]);

  return (
    <div className={`w-full ${classNames.wrapper || ""}`}>
      <Table
        aria-label="Data table"
        isHeaderSticky={sticky}
        isStriped={striped}
        isCompact={compact}
        removeWrapper={!bordered}
        selectionMode={selectable ? "multiple" : undefined}
        selectedKeys={selectedKeys}
        onSelectionChange={onSelectionChange as any}
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        // hoverable={hoverable}
        className={className}
        color={color}
      >
        <TableHeader>
          {columns.map((column) => (
            <TableColumn
              key={column.key}
              align={column.align || "start"}
              width={column.width}
              allowsSorting={column.sortable}
            >
              {column.label}
            </TableColumn>
          ))}
        </TableHeader>
        <TableBody
          items={dataSource}
          isLoading={loading}
          loadingContent={<Spinner label="Loading..." />}
          emptyContent={emptyContent}
        >
          {(item) => {
            const index = dataSource.indexOf(item);
            return (
              <TableRow key={getRowKey(item, index)}>
                {columns.map((column) => (
                  <TableCell key={column.key}>
                    {renderCell(item, column, index)}
                  </TableCell>
                ))}
              </TableRow>
            );
          }}
        </TableBody>
      </Table>
    </div>
  );
}
