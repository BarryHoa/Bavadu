"use client";

import { Spinner } from "@heroui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
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
import { useCallback, useMemo, useState } from "react";

import { IBaseTooltip } from "@base/client/components";
import { useTranslations } from "next-intl";
import PaginationComponent from "../Pagination/Pagination";
import {
  PAGINATION_DEFAULT_PAGE_SIZE,
  PAGINATION_PAGE_SIZE_OPTIONS,
} from "../Pagination/paginationConsts";
import {
  DATA_TABLE_COLUMN_KEY_ROW_NUMBER,
  type DataTablePagination,
  type DataTableProps,
  type ProcessedDataTableColumn,
} from "./DataTableInterface";
import useColumns from "./hooks/useColumns";
import useDataTableSelection from "./hooks/useDataTableSelection";

export default function DataTable<T = any>({
  columns,
  dataSource,
  total: totalProps = 0,
  rowKey = "id",
  pagination = { pageSize: PAGINATION_DEFAULT_PAGE_SIZE, page: 1 },
  loading = false,
  color = "primary",
  summary: _summary,
  rowSelection = false,
  onChangeTable,
  classNames = {},
  emptyContent = "No data available",
  tableLayout = "auto",
  isResizableColumns = true,
  isDraggableColumns = true,
  isRefreshData = true,
  onRefresh,
  ...rest
}: DataTableProps<T>) {
  const t = useTranslations("dataTable");
  /* Pagination */
  const isPaginationEnabled =
    pagination && typeof pagination === "object" ? true : false;
  const total = Math.max(0, typeof totalProps === "number" ? totalProps : 0);

  const paginationConfig = isPaginationEnabled
    ? (pagination as DataTablePagination)
    : undefined;

  const paginationDefault = useMemo(() => {
    if (!isPaginationEnabled) {
      return {
        page: 1,
        pageSize: PAGINATION_DEFAULT_PAGE_SIZE,
        pageSizeOptions: PAGINATION_PAGE_SIZE_OPTIONS,
      };
    }

    return {
      page: paginationConfig?.page ?? 1,
      pageSize: paginationConfig?.pageSize ?? PAGINATION_DEFAULT_PAGE_SIZE,
      pageSizeOptions:
        paginationConfig?.pageSizeOptions ?? PAGINATION_PAGE_SIZE_OPTIONS,
    };
  }, []);

  const [page, setPage] = useState(paginationDefault.page);
  const [pageSize, setPageSize] = useState(paginationDefault.pageSize);

  // build pagination info
  const paginationInfo = useMemo(() => {
    return {
      currentPage: page,
      pageSize,
      pages: Math.max(1, Math.ceil(total / pageSize)),
      from: total === 0 ? 0 : (page - 1) * pageSize,
      to: total === 0 ? 0 : Math.min(total, (page - 1) * pageSize + pageSize),
      total: total,
    };
  }, [page, pageSize, total]);

  /* End init Pagination */

  const processedColumns = useColumns(columns);

  const [sortDescriptor, setSortDescriptor] = useState<
    SortDescriptor | undefined
  >(undefined);

  const onInternalChangeTb = useCallback(
    ({
      page,
      pageSize,
      sort,
    }: {
      page?: number;
      pageSize?: number;
      sort?: SortDescriptor;
    }) => {
      if (page) {
        setPage(page);
      }
      if (pageSize) {
        setPageSize(pageSize);
      }
      if (sort) {
        setSortDescriptor(sort);
      }

      if (!onChangeTable) {
        return;
      }

      onChangeTable({
        page: page ?? paginationDefault.page,
        pageSize: pageSize ?? paginationDefault.pageSize,
        sort: sort ?? undefined,
      });
    },
    [onChangeTable, sortDescriptor, page, pageSize]
  );

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
    (nextPage: number) => {
      if (!isPaginationEnabled) {
        return;
      }

      const pages = Math.max(1, Math.ceil(total / paginationInfo.pageSize));
      const adjustedPage = Math.min(Math.max(1, nextPage), pages);

      onInternalChangeTb({
        page: adjustedPage,
      });
    },
    [isPaginationEnabled, onInternalChangeTb, paginationInfo.pageSize, total]
  );

  // Handle page size change
  const handlePageSizeChange = useCallback(
    (nextPageSize: number) => {
      if (!isPaginationEnabled) {
        return;
      }

      onInternalChangeTb({
        page: 1,
        pageSize: nextPageSize,
      });
    },
    [
      isPaginationEnabled,
      onInternalChangeTb,
      page,
      total,
      paginationDefault.pageSize,
    ]
  );

  const tableSelectionProps = useDataTableSelection(
    rowSelection,
    dataSource,
    getRowKey
  );

  const handleSortChange = useCallback(
    (descriptor: SortDescriptor) => {
      onInternalChangeTb({
        sort: descriptor,
        page: 1,
      });
    },
    [onInternalChangeTb]
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
        <div className={clsx("inline-flex h-full w-full items-center")}>
          <span
            className={clsx(
              "inline-flex w-full items-center px-2",
              isSortable && "cursor-pointer select-none",
              col.align === "end"
                ? "justify-end"
                : col.align === "center"
                  ? "justify-center"
                  : "justify-start"
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

  const paginationSummary = useMemo(() => {
    const rowsTotal = paginationInfo.total ?? 0;

    const from = Math.min(paginationInfo.from + 1, rowsTotal);
    const to = Math.min(paginationInfo.to, rowsTotal);

    return t("summary", { from, to, total: rowsTotal });
  }, [paginationInfo.from, paginationInfo.to, paginationInfo.total, t]);

  const showPaginationControls =
    isPaginationEnabled && (paginationInfo.total ?? 0) > 0;

  const shouldRenderFooter =
    isRefreshData ||
    Boolean(paginationSummary) ||
    (showPaginationControls && paginationInfo.pages > 1);

  const refreshLabel = t("refresh");
  const resolvedEmptyContent = emptyContent ?? t("empty");
  const loadingLabel = t("loading");

  // Attach index to each item so row render always biết đúng index,
  // hạn chế dùng Array.indexOf (có thể trả sai khi có object trùng).
  const dataSourceWithIndex = useMemo(
    () =>
      (dataSource ?? []).map((item, index) => ({
        item,
        index,
      })),
    [dataSource]
  );

  return (
    <div className={clsx("w-full bg-content1", classNames.wrapper)}>
      <div className="flex flex-1 flex-col gap-4">
        <Table
          aria-label={t("ariaLabel")}
          {...(tableSelectionProps ?? {})}
          isHeaderSticky
          isStriped
          isCompact
          layout={tableLayout}
          color={color}
          classNames={{
            ...classNames,
            tbody: clsx("overflow-x-auto", classNames.tbody),
            wrapper: clsx("rounded-none p-0", classNames.wrapper),
            th: clsx(
              "px-0 bg-primary-600 text-white hover:bg-primary-700/80",
              classNames.th
            ),
            tr: clsx("hover:bg-primary-700/10", classNames.tr),
            td: clsx("rounded-none py-1 px-2", classNames.td),
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
            emptyContent={resolvedEmptyContent}
            isLoading={loading}
            // Kiểu của TableBody không cho index, nên wrap thêm index vào item
            items={dataSourceWithIndex}
            loadingContent={<Spinner label={loadingLabel} />}
          >
            {({ item, index }: { item: T; index: number }) => {
              const rowKey = getRowKey(item, index);
              return (
                <TableRow key={rowKey}>
                  {processedColumns.map((col) => (
                    <TableCell
                      key={`${col.key}-${rowKey}`}
                      className={col.frozenClassName}
                      style={col.frozenStyle}
                    >
                      <div
                        className={clsx(
                          "flex",
                          `justify-${col.align || "start"}`
                        )}
                      >
                        {col.key === DATA_TABLE_COLUMN_KEY_ROW_NUMBER
                          ? paginationInfo.from + index + 1
                          : col.renderValue(item, index)}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              );
            }}
          </TableBody>
        </Table>
      </div>

      {shouldRenderFooter && (
        <div
          className={clsx(
            "flex flex-col items-center justify-between px-2 sm:flex-row",
            classNames.pagination
          )}
        >
          <div className="flex items-center py-2 text-small text-default-500">
            {paginationSummary}
            {isRefreshData && (
              <IBaseTooltip content={refreshLabel}>
                <button
                  type="button"
                  aria-label={refreshLabel}
                  className="ml-2 inline-flex items-center rounded p-1 transition-colors hover:bg-default-100"
                  onClick={onRefresh}
                >
                  <RefreshCw className="h-4 w-4 text-default-500 hover:text-primary" />
                </button>
              </IBaseTooltip>
            )}
          </div>

          {showPaginationControls && (
            <PaginationComponent
              page={paginationInfo.currentPage}
              pageSize={paginationInfo.pageSize}
              pages={paginationInfo.pages}
              pageSizeOptions={paginationDefault.pageSizeOptions}
              onChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
        </div>
      )}
    </div>
  );
}
