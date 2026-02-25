"use client";

import type { Selection, TableProps } from "@heroui/table";

import clsx from "clsx";
import { RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

import IBaseTooltip from "../IBaseTooltip";
import PaginationComponent from "../Pagination/Pagination";
import { PAGINATION_DEFAULT_PAGE_SIZE } from "../Pagination/paginationConsts";

import { useIBaseTableCore } from "./IBaseTableCore";
import {
  I_BASE_TABLE_COLUMN_KEY_ROW_NUMBER,
  type IBaseTableColumnDefinition,
  type IBaseTableProps as IBaseTablePropsType,
  type ProcessedIBaseTableColumn,
} from "./IBaseTableInterface";
import IBaseTableUI from "./IBaseTableUI";
import processColumn from "./ultis/hooks/processColumn";
import { useIBaseTablePagination } from "./ultis/hooks/useIBaseTablePagination";

export function IBaseTable<T = any>({
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
  scrollHeight,
  scrollWidth,
  tableLayout,
  isResizableColumns = true,
  isDraggableColumns = true,
  isRefreshData = true,
  onRefresh,
  ...rest
}: IBaseTablePropsType<T>) {
  const t = useTranslations("dataTable");

  const iBaseTableColumns = useMemo(
    () => columns.map((col) => processColumn<T>(col, isResizableColumns)),
    [columns, isResizableColumns],
  );

  // Core table logic - all logic is now in useIBaseTableCore
  const core = useIBaseTableCore<T>({
    data: dataSource,
    columns: iBaseTableColumns,
    rowKey,
    pagination:
      pagination && typeof pagination === "object"
        ? {
            page: pagination.page ?? 1,
            pageSize: pagination.pageSize ?? PAGINATION_DEFAULT_PAGE_SIZE,
            total: Math.max(0, typeof totalProps === "number" ? totalProps : 0),
          }
        : false,
    manualPagination: true,
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
    onChangeTable, // Combined callback for pagination + sorting
    onRowSelectionChange: (selectedRowKeys, selectedRows) => {
      if (rowSelection !== false && rowSelection?.onChange) {
        rowSelection.onChange(selectedRowKeys, selectedRows);
      }
    },
  });

  // All pagination logic is handled by useIBaseTablePagination hook
  const paginationState = useIBaseTablePagination({
    pagination,
    total: totalProps,
    paginationInfo: core.paginationInfo,
  });

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

  // Use pagination summary from hook and translate it
  const paginationSummary = useMemo(() => {
    return t("summary", paginationState.paginationSummary);
  }, [paginationState.paginationSummary, t]);

  const shouldRenderFooter =
    isRefreshData ||
    Boolean(paginationSummary) ||
    (paginationState.showPaginationControls &&
      paginationState.paginationInfo.pages > 1);

  return (
    <div className={clsx("w-full bg-content1", classNames.wrapper)}>
      <div className={clsx("flex flex-1 flex-col")}>
        <IBaseTableUI
          aria-label={t("ariaLabel")}
          classNames={classNames}
          color={color}
          columnOrder={core.columnOrderState}
          emptyContent={emptyContent ?? t("empty")}
          enableColumnOrdering={isDraggableColumns}
          enableColumnResizing={isResizableColumns}
          getRowKey={core.getRowKey}
          headerGroups={core.headerGroups}
          isCompact={true}
          isHeaderSticky={true}
          isStriped={true}
          loading={loading}
          renderCell={(column, row, cellValue) => {
            // Handle row number column with pagination offset
            const meta = (column?.columnDef?.meta as Record<string, any>) || {};

            if (meta.isRowNumber && paginationState.paginationInfo) {
              return paginationState.paginationInfo.from + row.index + 1;
            }

            // Return undefined - IBaseTableUI will check and use flexRender if undefined
            return undefined;
          }}
          rows={core.rows}
          scrollHeight={scrollHeight}
          scrollWidth={scrollWidth}
          selectedKeys={selectionProps?.selectedKeys}
          selectionMode={selectionProps?.selectionMode}
          setColumnOrder={core.setColumnOrder}
          sortDescriptor={core.sortDescriptor}
          tableLayout={tableLayout}
          visibleColumns={core.visibleColumns}
          onSelectionChange={selectionProps?.onSelectionChange}
          onSortChange={core.handleSortChange}
          {...rest}
        />
      </div>

      {shouldRenderFooter && (
        <div
          className={clsx(
            "flex flex-col items-center justify-between px-2 sm:flex-row",
            classNames.pagination,
          )}
        >
          <div className="flex items-center py-2 text-small text-default-500">
            {paginationSummary}
            {isRefreshData && (
              <IBaseTooltip content={t("refresh")}>
                <button
                  aria-label={t("refresh")}
                  className="ml-2 inline-flex items-center rounded p-1 transition-colors hover:bg-default-100"
                  type="button"
                  onClick={onRefresh}
                >
                  <RefreshCw className="h-4 w-4 text-default-500 hover:text-primary" />
                </button>
              </IBaseTooltip>
            )}
          </div>

          {paginationState.showPaginationControls &&
            core.handlePageChange &&
            core.handlePageSizeChange && (
              <PaginationComponent
                page={paginationState.paginationInfo.currentPage}
                pageSize={paginationState.paginationInfo.pageSize}
                pageSizeOptions={
                  paginationState.paginationDefault.pageSizeOptions
                }
                pages={paginationState.paginationInfo.pages}
                onChange={core.handlePageChange}
                onPageSizeChange={core.handlePageSizeChange}
              />
            )}
        </div>
      )}
    </div>
  );
}
export default IBaseTable;
