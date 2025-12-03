"use client";

import { RefreshCw } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import type {
  IBaseTableCoreColumn,
  IBaseTableCoreProps,
} from "@base/client/components";
import { IBaseTooltip } from "@base/client/components";
import { useIBaseTableCore } from "@base/client/components/IBaseTable/IBaseTableCore";
import IBaseTableUI from "@base/client/components/IBaseTable/IBaseTableUI";
import type { Selection } from "@heroui/react";
import type { TableProps } from "@heroui/table";
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

  const processedColumns = useColumns(columns);

  // Track initial sorting for onChangeTable callback
  const [initialSort, setInitialSort] = useState<SortDescriptor | undefined>(
    undefined
  );

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
        isRowNumber: col.key === DATA_TABLE_COLUMN_KEY_ROW_NUMBER,
      },
    }));
  }, [processedColumns]);

  // Core table logic using useIBaseTableCore
  const coreProps: IBaseTableCoreProps<T> = useMemo(
    () => ({
      data: dataSource,
      columns: iBaseTableColumns,
      rowKey,
      pagination: isPaginationEnabled
        ? {
            page: paginationConfig?.page ?? 1,
            pageSize:
              paginationConfig?.pageSize ?? PAGINATION_DEFAULT_PAGE_SIZE,
            total,
          }
        : false,
      manualPagination: true,
      sorting: initialSort,
      manualSorting: true,
      rowSelection:
        rowSelection === false
          ? false
          : {
              type: rowSelection?.type || "multiple",
              selectedRowKeys: rowSelection?.selectedRowKeys,
              onChange: rowSelection?.onChange,
            },
      enableColumnResizing: isResizableColumns,
      enableColumnPinning: true,
      enableColumnOrdering: isDraggableColumns,
      onPaginationChange: (page, pageSize) => {
        if (onChangeTable) {
          onChangeTable({
            page,
            pageSize,
            sort: initialSort,
          });
        }
      },
      onSortingChange: (sort) => {
        setInitialSort(sort);
        if (onChangeTable) {
          onChangeTable({
            page: paginationConfig?.page ?? 1,
            pageSize:
              paginationConfig?.pageSize ?? PAGINATION_DEFAULT_PAGE_SIZE,
            sort: sort ?? undefined,
          });
        }
      },
      onRowSelectionChange: (selectedRowKeys, selectedRows) => {
        if (rowSelection !== false && rowSelection?.onChange) {
          rowSelection.onChange(selectedRowKeys, selectedRows);
        }
      },
    }),
    [
      dataSource,
      iBaseTableColumns,
      rowKey,
      isPaginationEnabled,
      paginationConfig,
      total,
      initialSort,
      rowSelection,
      isResizableColumns,
      isDraggableColumns,
      onChangeTable,
    ]
  );

  const core = useIBaseTableCore<T>(coreProps);

  // Pagination info for UI
  const paginationInfo = useMemo(() => {
    const currentPage = core.paginationState.pageIndex + 1; // Convert 0-based to 1-based
    const pageSize = core.paginationState.pageSize;
    const pages = Math.max(1, Math.ceil(total / pageSize));
    const from = total === 0 ? 0 : core.paginationState.pageIndex * pageSize;
    const to = total === 0 ? 0 : Math.min(total, from + pageSize);

    return {
      currentPage,
      pageSize,
      pages,
      from,
      to,
      total,
    };
  }, [core.paginationState, total]);

  // Get row key function
  const getRowKey = useCallback(
    (record: T, index: number): string => {
      if (typeof rowKey === "function") {
        const keyValue = (
          rowKey as (record: T, index: number) => string | number
        )(record, index);
        return String(keyValue);
      }
      const key = (record as any)[rowKey as string];
      return key !== undefined && key !== null ? String(key) : String(index);
    },
    [rowKey]
  );

  // Handle page change
  const handlePageChange = useCallback(
    (nextPage: number) => {
      if (!isPaginationEnabled) {
        return;
      }

      const adjustedPage = Math.min(
        Math.max(1, nextPage),
        paginationInfo.pages
      );
      core.setPagination({
        pageIndex: adjustedPage - 1, // Convert to 0-based
        pageSize: paginationInfo.pageSize,
      });
    },
    [isPaginationEnabled, paginationInfo.pages, paginationInfo.pageSize, core]
  );

  // Handle page size change
  const handlePageSizeChange = useCallback(
    (nextPageSize: number) => {
      if (!isPaginationEnabled) return;

      core.setPagination({
        pageIndex: 0, // Reset to first page
        pageSize: nextPageSize,
      });
    },
    [isPaginationEnabled, core]
  );

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
      // onChangeTable is called via onSortingChange in coreProps
    },
    [core]
  );

  // Convert row selection state to HeroUI format
  const selectionProps = useMemo(() => {
    if (rowSelection === false) {
      return undefined;
    }

    const selectedKeysSet = new Set(core.selectedRowKeys);

    return {
      selectionMode: (rowSelection?.type === "single"
        ? "single"
        : "multiple") as TableProps["selectionMode"],
      selectedKeys: selectedKeysSet.size > 0 ? selectedKeysSet : undefined,
      onSelectionChange: (keys: Selection) => {
        if (keys === "all") {
          core.toggleAllRowsSelection(true);
        } else if (keys instanceof Set) {
          const newSelection: Record<string, boolean> = {};
          keys.forEach((key) => {
            newSelection[String(key)] = true;
          });
          core.setRowSelection(newSelection);
        } else {
          core.resetRowSelection();
        }
      },
    };
  }, [rowSelection, core]);

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
        <IBaseTableUI
          headerGroups={core.headerGroups}
          rows={core.rows}
          visibleColumns={core.visibleColumns}
          loading={loading}
          emptyContent={emptyContent ?? t("empty")}
          classNames={classNames}
          tableLayout={tableLayout}
          color={color}
          isStriped={true}
          isCompact={true}
          isHeaderSticky={true}
          selectionMode={selectionProps?.selectionMode}
          selectedKeys={selectionProps?.selectedKeys}
          onSelectionChange={selectionProps?.onSelectionChange}
          sortDescriptor={sortDescriptor}
          onSortChange={handleSortChange}
          getRowKey={getRowKey}
          renderCell={(column, row, cellValue) => {
            // Handle row number column with pagination offset
            const meta = (column.columnDef.meta as Record<string, any>) || {};
            if (meta.isRowNumber) {
              const from =
                total === 0
                  ? 0
                  : core.paginationState.pageIndex *
                    core.paginationState.pageSize;
              return from + row.index + 1;
            }
            // Return undefined - IBaseTableUI will check and use flexRender if undefined
            return undefined;
          }}
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
