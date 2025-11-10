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
import type { SortDescriptor } from "@react-types/shared";
import clsx from "clsx";
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  RefreshCw,
} from "lucide-react";
import type { ReactNode } from "react";
import { useCallback, useMemo, useState } from "react";

import PaginationComponent from "../Pagination/Pagination";
import {
  PAGINATION_DEFAULT_PAGE_SIZE,
  PAGINATION_PAGE_SIZE_OPTIONS,
} from "../Pagination/paginationConsts";
import usePagination from "../Pagination/usePagination";
import {
  type DataTableColumnDefinition,
  type ProcessedDataTableColumn,
} from "./DataTableInterace";
import useColumns from "./hooks/useColumns";
import useDataTableSelection, {
  type DataTableRowSelection,
} from "./hooks/useDataTableSelection";

export interface DataTableSummary {
  label?: string;
  values: Record<string, ReactNode>;
}

export type DataTableProps<T = any> = TableProps & {
  columns: DataTableColumnDefinition<T>[];
  dataSource: T[];
  total?: number;
  rowKey?: string;
  tableLayout?: "auto" | "fixed";
  isResizableColumns?: boolean;
  isDraggableColumns?: boolean;
  isRefreshData?: boolean;

  // Pagination
  pagination?:
    | {
        pageSize?: number;
        pageSizeOptions?: number[];
        page?: number;
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
  total: totalProps = 0,
  rowKey = "id",
  pagination = { pageSize: PAGINATION_DEFAULT_PAGE_SIZE, page: 1 },
  loading = false,
  color = "primary",
  summary,
  rowSelection = false,
  onChangeTable,
  classNames = {},
  emptyContent = "No data available",
  tableLayout = "auto",
  isResizableColumns = true,
  isDraggableColumns = true,
  isRefreshData = true,
  ...rest
}: DataTableProps<T>) {
  const total = typeof totalProps === "number" ? totalProps : 0;
  const processedColumns = useColumns(columns);
  const [sortDescriptor, setSortDescriptor] = useState<
    SortDescriptor | undefined
  >(undefined);

  const notifyTableChange = useCallback(
    (page: number, pageSize: number) => {
      if (!onChangeTable) {
        return;
      }

      onChangeTable({
        page,
        pageSize,
        sortColumn: sortDescriptor?.column?.toString(),
        sortDirection: sortDescriptor?.direction,
      });
    },
    [onChangeTable, sortDescriptor]
  );

  const isPaginationEnabled =
    pagination && typeof pagination === "object" ? true : false;

  const paginationSettings = useMemo(() => {
    if (!isPaginationEnabled || !pagination) {
      return {
        pageSizeOptions: PAGINATION_PAGE_SIZE_OPTIONS,
        defaultPageSize: PAGINATION_DEFAULT_PAGE_SIZE,
        defaultPage: 1,
        total: 0,
      };
    }

    return {
      pageSizeOptions:
        pagination.pageSizeOptions ?? PAGINATION_PAGE_SIZE_OPTIONS,
      defaultPageSize:
        pagination.pageSize ??
        pagination.pageSizeOptions?.[0] ??
        PAGINATION_DEFAULT_PAGE_SIZE,
      defaultPage: pagination.page ?? 1,
      total,
    };
  }, [isPaginationEnabled, pagination, total]);

  const paginationInfo = usePagination({
    ...paginationSettings,
    onChange: isPaginationEnabled
      ? ({ page, pageSize }) => notifyTableChange(page, pageSize)
      : undefined,
  });

  const isExistingRowKey = useMemo(() => {
    return (
      typeof rowKey === "string" && rowKey in ((dataSource?.[0] as any) ?? {})
    );
  }, [rowKey, dataSource]);

  // Get row key
  const getRowKey = useCallback(
    (record: T, index: number) => {
      if (isExistingRowKey) {
        const val = (record as any)[rowKey];

        if (typeof val === "string" || typeof val === "number") {
          return val;
        }
      }

      return index;
    },
    [rowKey, isExistingRowKey]
  );

  // Handle page change
  const handlePageChange = useCallback(
    (page: number) => {
      const newPage = paginationInfo.handleChangePage(page);
      notifyTableChange(newPage, paginationInfo.pageSize);
    },
    [notifyTableChange, paginationInfo]
  );

  // Handle page size change
  const handlePageSizeChange = useCallback(
    (pageSize: number) => {
      const newPageSize = paginationInfo.handleChangePageSize(pageSize);
      notifyTableChange(paginationInfo.currentPage, newPageSize);
    },
    [notifyTableChange, paginationInfo]
  );

  const tableSelectionProps = useDataTableSelection(
    rowSelection,
    dataSource,
    getRowKey
  );

  const handleSortChange = useCallback(
    (descriptor: SortDescriptor) => {
      setSortDescriptor(descriptor);
      notifyTableChange(paginationInfo.currentPage, paginationInfo.pageSize);
    },
    [notifyTableChange, paginationInfo.currentPage, paginationInfo.pageSize]
  );

  const toggleSortForColumn = useCallback(
    (col: ProcessedDataTableColumn<T>) => {
      if (!col.sortable) {
        return;
      }

      const isSameColumn = sortDescriptor?.column === col.key;
      const nextDirection =
        !isSameColumn || sortDescriptor?.direction === "descending"
          ? "ascending"
          : "descending";

      handleSortChange({
        column: col.key,
        direction: nextDirection,
      });
    },
    [handleSortChange, sortDescriptor]
  );

  const sortIcons = useMemo(
    () => ({
      default: (
        <ChevronsUpDown className="h-3.5 w-3.5 opacity-70" aria-hidden />
      ),
      ascending: <ChevronUp className="h-3.5 w-3.5 opacity-90" aria-hidden />,
      descending: (
        <ChevronDown className="h-3.5 w-3.5 opacity-90" aria-hidden />
      ),
    }),
    []
  );

  const renderTitleHeader = useCallback(
    (col: ProcessedDataTableColumn<T>) => {
      const isSortable = Boolean(col.sortable);
      const isResizable = col.isResizable ?? isResizableColumns;
      const isDraggable = col.isDraggable ?? isDraggableColumns;
      const isSorted = sortDescriptor?.column === col.key;
      const direction = (isSorted ? sortDescriptor?.direction : "default") as
        | "ascending"
        | "descending"
        | "default";

      return (
        <div className="inline-flex h-full w-full items-center">
          <span
            className={clsx(
              "inline-flex w-full items-center px-2",
              isSortable && "cursor-pointer select-none"
            )}
            onClick={() => toggleSortForColumn(col)}
            role={isSortable ? "button" : undefined}
            tabIndex={isSortable ? 0 : -1}
          >
            <span className="mr-2 text-nowrap">
              {col.label ?? col.title ?? ""}
            </span>
            {isSortable ? (
              <span className="inline-flex items-center justify-end">
                {sortIcons[direction] ?? sortIcons.default}
              </span>
            ) : null}
          </span>

          {isResizable && (
            <span className="inline-flex h-full w-2 hover:cursor-col-resize hover:bg-warning-400/50" />
          )}
        </div>
      );
    },
    [
      isDraggableColumns,
      isResizableColumns,
      sortDescriptor,
      sortIcons,
      toggleSortForColumn,
    ]
  );

  const handleRefresh = useCallback(() => {
    notifyTableChange(paginationInfo.currentPage, paginationInfo.pageSize);
  }, [notifyTableChange, paginationInfo.currentPage, paginationInfo.pageSize]);

  const paginationSummary = useMemo(() => {
    if (!isPaginationEnabled || !pagination) {
      return null;
    }

    const showTotal = pagination.showTotal ?? true;
    if (!showTotal) {
      return null;
    }

    const from = paginationInfo.from + 1;
    const to = paginationInfo.to;
    const rowsTotal = paginationSettings.total;

    return `Showing ${Math.min(from, rowsTotal)} to ${to} of ${rowsTotal} entries`;
  }, [
    isPaginationEnabled,
    pagination,
    paginationInfo.from,
    paginationInfo.to,
    paginationSettings.total,
  ]);

  return (
    <div className={clsx("w-full bg-content1", classNames.wrapper)}>
      <div className="flex flex-1 flex-col gap-4">
        <Table
          aria-label="Data table"
          {...(tableSelectionProps ?? {})}
          isHeaderSticky
          isStriped
          isCompact
          layout={tableLayout}
          classNames={{
            ...classNames,
            tbody: clsx("overflow-x-auto", classNames.tbody),
            wrapper: clsx("rounded-none p-2", classNames.wrapper),
            th: clsx(
              "px-0 bg-primary-600 text-white hover:bg-primary-700/80",
              classNames.th
            ),
            tr: clsx("hover:bg-primary-700/10", classNames.tr),
            td: clsx("rounded-none", classNames.td),
          }}
          // sortDescriptor={sortDescriptor}
          // onSortChange={handleSortChange}
          {...rest}
        >
          <TableHeader>
            {processedColumns.map((col) => (
              <TableColumn
                key={col.key}
                align={col.align || "start"}
                allowsSorting={false}
                className={clsx(col.frozenClassName)}
                style={col.frozenStyle}
                width={col.width}
                minWidth={col.minWidth}
                maxWidth={col.maxWidth}
              >
                {renderTitleHeader(col)}
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
                  {processedColumns.map((col) => (
                    <TableCell
                      key={col.key}
                      className={col.frozenClassName}
                      style={col.frozenStyle}
                    >
                      <div
                        className={clsx(
                          "flex",
                          `justify-${col.align || "start"}`
                        )}
                      >
                        {col.renderValue(item, index)}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              );
            }}
          </TableBody>
        </Table>
      </div>

      <div
        className={clsx(
          "flex flex-col items-center justify-between px-2 sm:flex-row",
          classNames.pagination
        )}
      >
        <div className="flex items-center py-2 text-small text-default-500">
          {paginationSummary}
          {isRefreshData && (
            <button
              type="button"
              aria-label="Refresh data"
              className="ml-2 inline-flex items-center rounded p-1 transition-colors hover:bg-default-100"
              onClick={handleRefresh}
            >
              <RefreshCw className="h-4 w-4 text-default-500 hover:text-primary" />
            </button>
          )}
        </div>

        {isPaginationEnabled && paginationInfo.pages > 1 && (
          <PaginationComponent
            page={paginationInfo.currentPage}
            pageSize={paginationInfo.pageSize}
            pages={paginationInfo.pages}
            onChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
      </div>
    </div>
  );
}
