"use client";

import { RefreshCw } from "lucide-react";
import { useMemo } from "react";

import type { IBaseTableCoreColumn } from "@base/client/components";
import { IBaseTooltip } from "@base/client/components";
import type { Selection } from "@heroui/react";
import type { TableProps } from "@heroui/table";
import clsx from "clsx";
import { useTranslations } from "next-intl";
import PaginationComponent from "../Pagination/Pagination";
import { PAGINATION_DEFAULT_PAGE_SIZE } from "../Pagination/paginationConsts";
import { useIBaseTableCore } from "./IBaseTableCore";
import {
  I_BASE_TABLE_COLUMN_KEY_ROW_NUMBER,
  type IBaseTableProps as IBaseTablePropsType,
} from "./IBaseTableInterface";
import IBaseTableUI from "./IBaseTableUI";
import useColumns from "./hooks/useColumns";
import { useIBaseTablePagination } from "./hooks/useIBaseTablePagination";

export default function IBaseTable<T = any>({
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
}: IBaseTablePropsType<T>) {
  const t = useTranslations("dataTable");

  const processedColumns = useColumns(columns);

  // Convert ProcessedIBaseTableColumn to IBaseTableCoreColumn
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
        isRowNumber: col.key === I_BASE_TABLE_COLUMN_KEY_ROW_NUMBER,
      },
    }));
  }, [processedColumns]);

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
          sortDescriptor={core.sortDescriptor}
          onSortChange={core.handleSortChange}
          getRowKey={core.getRowKey}
          renderCell={(column, row, cellValue) => {
            // Handle row number column with pagination offset
            const meta = (column.columnDef.meta as Record<string, any>) || {};
            if (meta.isRowNumber && paginationState.paginationInfo) {
              return paginationState.paginationInfo.from + row.index + 1;
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

          {paginationState.showPaginationControls &&
            core.handlePageChange &&
            core.handlePageSizeChange && (
              <PaginationComponent
                page={paginationState.paginationInfo.currentPage}
                pageSize={paginationState.paginationInfo.pageSize}
                pages={paginationState.paginationInfo.pages}
                pageSizeOptions={
                  paginationState.paginationDefault.pageSizeOptions
                }
                onChange={core.handlePageChange}
                onPageSizeChange={core.handlePageSizeChange}
              />
            )}
        </div>
      )}
    </div>
  );
}
