import type { ReactNode } from "react";

import type { IBaseTableCoreColumn } from "../../IBaseTableCore";
import {
  I_BASE_TABLE_COLUMN_KEY_ACTION,
  I_BASE_TABLE_COLUMN_KEY_ROW_NUMBER,
  type IBaseTableColumnDefinition,
} from "../../IBaseTableInterface";

const SPECIAL_KEYS = [
  I_BASE_TABLE_COLUMN_KEY_ROW_NUMBER,
  I_BASE_TABLE_COLUMN_KEY_ACTION,
] as const;

const FIXED_BY_KEY: Record<string, "left" | "right"> = {
  [I_BASE_TABLE_COLUMN_KEY_ROW_NUMBER]: "left",
  [I_BASE_TABLE_COLUMN_KEY_ACTION]: "right",
};

const ALIGN_BY_KEY: Record<string, "start" | "center" | "end"> = {
  [I_BASE_TABLE_COLUMN_KEY_ROW_NUMBER]: "center",
  [I_BASE_TABLE_COLUMN_KEY_ACTION]: "center",
};

const WIDTH_BY_KEY: Record<string, number> = {
  [I_BASE_TABLE_COLUMN_KEY_ROW_NUMBER]: 80,
  [I_BASE_TABLE_COLUMN_KEY_ACTION]: 80,
};

const buildRenderValue = <T>(
  column: IBaseTableColumnDefinition<T>,
): ((value: any, record: T, index: number) => ReactNode) => {
  return (value: any, record: T, index: number) => {
    if (column.render) {
      return column.render(value, record, index);
    }

    return value;
  };
};

function buildCoreColumn<T>(
  column: IBaseTableColumnDefinition<T>,
  isResizableColumns: boolean,
): IBaseTableCoreColumn<T> {
  const isSpecialKey = SPECIAL_KEYS.includes(column.key);

  const fixed =
    column.fixed ?? (FIXED_BY_KEY[column.key] as "left" | "right" | undefined);
  const width =
    column.width ?? (WIDTH_BY_KEY[column.key] as number | undefined);
  const align =
    column.align ??
    (ALIGN_BY_KEY[column.key] as "start" | "center" | "end" | undefined);

  return {
    key: column.key,
    title: column.title,
    label: column.label,
    dataIndex: column.dataIndex,
    align,
    width,
    minWidth: column.minWidth,
    maxWidth: column.maxWidth,
    sortable: column.sortable,
    fixed,
    render: buildRenderValue(column),
    isResizable: isSpecialKey ? false : column.isResizable,
    isDraggable: isSpecialKey ? false : column.isDraggable,
    enableSorting: column.sortable,
    enablePinning: !!fixed,
    enableResizing:
      !isSpecialKey && isResizableColumns && column.isResizable !== false,
    meta: {
      isRowNumber: column.key === I_BASE_TABLE_COLUMN_KEY_ROW_NUMBER,
    },
  };
}

function processColumn<T>(
  column: IBaseTableColumnDefinition<T>,
  isResizableColumns: boolean,
): IBaseTableCoreColumn<T> {
  const hasChildren =
    Array.isArray(column.children) && column.children.length > 0;

  const base = buildCoreColumn(column, isResizableColumns);

  if (!hasChildren) {
    return base;
  }

  return {
    ...base,
    // Group header không render giá trị cell, chỉ dùng để group
    render: () => null,
    children: column.children!.map((child) =>
      processColumn(child, isResizableColumns),
    ),
  };
}

export default processColumn;
