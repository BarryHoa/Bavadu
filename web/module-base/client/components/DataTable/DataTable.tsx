"use client";

import { Spinner } from "@heroui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableProps,
  TableRow,
} from "@heroui/table";
import type { ReactNode } from "react";
import { useCallback, useMemo, useState } from "react";

import {
  PAGINATION_DEFAULT_PAGE_SIZE,
  PAGINATION_PAGE_SIZE_OPTIONS,
} from "../Pagination/pagginationConts";
import PaginationComponent from "../Pagination/Pagination";
import usePagination from "../Pagination/usePagination";
import { type DataTableColumnDefinition } from "./DataTableColumn";
import useColumns from "./hooks/useColumns";
import useDataTableSelection, {
  type DataTableRowSelection,
} from "./hooks/useDataTableSelection";
export type { DataTableColumnDefinition } from "./DataTableColumn";

export interface DataTableSummary {
  label?: string;
  values: Record<string, ReactNode>;
}

export type DataTableProps<T = any> = TableProps & {
  columns: DataTableColumnDefinition<T>[];
  dataSource: T[];
  rowKey?: string;
  tableLayout?: "auto" | "fixed";

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
  rowSelection?: false | DataTableRowSelection<T>;

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
  rowSelection = false,
  onChangeTable,
  className = "",
  classNames = {},
  emptyContent = "No data available",
  tableLayout = "auto",
  ...rest
}: DataTableProps<T>) {
  const isPagination = pagination && typeof pagination === "object";
  const processedColumns = useColumns(columns);

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
          return val;
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

  const tableSelectionProps = useDataTableSelection(
    rowSelection,
    dataSource,
    getRowKey
  );

  return (
    <div className={`w-full bg-content1 ${classNames.wrapper || ""}`}>
      <div className="flex flex-col gap-4 flex-1">
        <Table
          aria-label="Data table"
          {...(tableSelectionProps ?? {})}
          isHeaderSticky
          isStriped
          isCompact
          layout={tableLayout}
          // bottomContent={bottomContent}
          className={className}
          classNames={{
            ...classNames,
            tbody: "overflow-x-auto",
            wrapper: "p-2 rounded-none",
            th: "bg-primary-700 text-white hover:bg-primary-700/80",
            tr: "hover:bg-primary-700/10 ",
            td: "rounded-none",
          }}
          {...rest}
        >
          <TableHeader>
            {processedColumns.map((column) => (
              <TableColumn
                key={column.key}
                align={column.align || "start"}
                allowsSorting={column.sortable}
                className={column.frozenClassName}
                style={column.frozenStyle}
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
            {(item: T) => {
              const index = dataSource.indexOf(item);

              return (
                <TableRow key={getRowKey(item, index)}>
                  {processedColumns.map((column) => (
                    <TableCell
                      key={column.key}
                      className={column.frozenClassName}
                      style={column.frozenStyle}
                    >
                      {column.renderValue(item, index)}
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
