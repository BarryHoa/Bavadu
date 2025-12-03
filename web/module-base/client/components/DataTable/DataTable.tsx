"use client";

import { RefreshCw } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import type { IBaseTableCoreColumn } from "@base/client/components";
import { IBaseTable, IBaseTooltip } from "@base/client/components";
import type { SortDescriptor } from "@react-types/shared";
import clsx from "clsx";
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
} from "./DataTableInterface";
import useColumns from "./hooks/useColumns";

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

  // Pagination setup
  const isPaginationEnabled = pagination && typeof pagination === "object";
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
  }, [isPaginationEnabled, paginationConfig]);

  const [page, setPage] = useState(paginationDefault.page);
  const [pageSize, setPageSize] = useState(paginationDefault.pageSize);

  // Pagination info
  const paginationInfo = useMemo(() => {
    const pages = Math.max(1, Math.ceil(total / pageSize));
    const from = total === 0 ? 0 : (page - 1) * pageSize;
    const to = total === 0 ? 0 : Math.min(total, from + pageSize);

    return {
      currentPage: page,
      pageSize,
      pages,
      from,
      to,
      total,
    };
  }, [page, pageSize, total]);

  const processedColumns = useColumns(columns);

  const [sortDescriptor, setSortDescriptor] = useState<
    SortDescriptor | undefined
  >(undefined);

  // Convert ProcessedDataTableColumn to IBaseTableCoreColumn
  const iBaseTableColumns = useMemo<IBaseTableCoreColumn<T>[]>(() => {
    return processedColumns.map((col) => ({
      key: col.key,
      title: col.title,
      label: col.label,
      dataIndex: col.dataIndex,
      align: col.align,
      width: col.width,
      minWidth: col.minWidth,
      maxWidth: col.maxWidth,
      sortable: col.sortable,
      fixed: col.fixed,
      render: (value: any, record: T, index: number) => {
        // Handle row number column specially
        if (col.key === DATA_TABLE_COLUMN_KEY_ROW_NUMBER) {
          return paginationInfo.from + index + 1;
        }
        // Use renderValue from processed column
        return col.renderValue(record, index);
      },
      isResizable: col.isResizable,
      isDraggable: col.isDraggable,
      enableSorting: col.sortable,
      enablePinning: !!col.fixed,
      enableResizing: col.isResizable,
      meta: {
        frozenStyle: col.frozenStyle,
        frozenClassName: col.frozenClassName,
      },
    }));
  }, [processedColumns, paginationInfo.from]);

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
    [onChangeTable, paginationDefault]
  );

  const isExistingRowKey = useMemo(() => {
    return (
      typeof rowKey === "string" && rowKey in ((dataSource?.[0] as any) ?? {})
    );
  }, [rowKey, dataSource]);

  // Get row key - convert to string for IBaseTable compatibility
  const getRowKey = useCallback(
    (record: T, index: number): string => {
      if (isExistingRowKey) {
        const val = (record as any)[rowKey];

        if (val !== undefined && val !== null) {
          return String(val);
        }
      }

      return String(index);
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
      if (!isPaginationEnabled) return;

      onInternalChangeTb({
        page: 1,
        pageSize: nextPageSize,
      });
    },
    [isPaginationEnabled, onInternalChangeTb]
  );

  // Map row selection to IBaseTable format
  const iBaseTableRowSelection = useMemo(() => {
    if (rowSelection === false) return false;

    return {
      type: rowSelection?.type || "multiple",
      selectedRowKeys: rowSelection?.selectedRowKeys,
      onChange: rowSelection?.onChange,
    };
  }, [rowSelection]);

  const handleSortChange = useCallback(
    (descriptor: SortDescriptor | undefined) => {
      if (descriptor) {
        onInternalChangeTb({
          sort: descriptor,
          page: 1,
        });
      } else {
        setSortDescriptor(undefined);
      }
    },
    [onInternalChangeTb]
  );

  const handlePaginationChange = useCallback(
    (page: number, pageSize: number) => {
      onInternalChangeTb({
        page,
        pageSize,
      });
    },
    [onInternalChangeTb]
  );

  const handleRowSelectionChange = useCallback(
    (selectedRowKeys: (string | number)[], selectedRows: T[]) => {
      if (rowSelection !== false && rowSelection?.onChange) {
        rowSelection.onChange(selectedRowKeys, selectedRows);
      }
    },
    [rowSelection]
  );

  const paginationSummary = useMemo(() => {
    const rowsTotal = paginationInfo.total;
    const from = Math.min(paginationInfo.from + 1, rowsTotal);
    const to = Math.min(paginationInfo.to, rowsTotal);

    return t("summary", { from, to, total: rowsTotal });
  }, [paginationInfo.from, paginationInfo.to, paginationInfo.total, t]);

  const showPaginationControls =
    isPaginationEnabled && paginationInfo.total > 0;

  const shouldRenderFooter =
    isRefreshData ||
    Boolean(paginationSummary) ||
    (showPaginationControls && paginationInfo.pages > 1);

  return (
    <div className={clsx("w-full bg-content1", classNames.wrapper)}>
      <div className="flex flex-1 flex-col gap-4">
        <IBaseTable
          columns={iBaseTableColumns}
          data={dataSource}
          rowKey={getRowKey}
          pagination={
            isPaginationEnabled
              ? {
                  page: paginationInfo.currentPage,
                  pageSize: paginationInfo.pageSize,
                  total: paginationInfo.total,
                }
              : false
          }
          manualPagination={true}
          sorting={sortDescriptor}
          manualSorting={true}
          rowSelection={iBaseTableRowSelection}
          loading={loading}
          emptyContent={emptyContent ?? t("empty")}
          tableLayout={tableLayout}
          color={color}
          isStriped={true}
          isCompact={true}
          isHeaderSticky={true}
          enableColumnResizing={isResizableColumns}
          enableColumnPinning={true}
          enableColumnOrdering={isDraggableColumns}
          classNames={classNames}
          onPaginationChange={handlePaginationChange}
          onSortingChange={handleSortChange}
          onRowSelectionChange={handleRowSelectionChange}
          aria-label={t("ariaLabel")}
          {...rest}
        />
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
              <IBaseTooltip content={t("refresh")}>
                <button
                  type="button"
                  aria-label={t("refresh")}
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
