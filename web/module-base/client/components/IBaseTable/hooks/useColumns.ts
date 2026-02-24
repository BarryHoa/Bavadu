import type { ReactNode } from "react";

import { useTranslations } from "next-intl";
import { useMemo } from "react";

import {
  I_BASE_TABLE_COLUMN_KEY_ACTION,
  I_BASE_TABLE_COLUMN_KEY_ROW_NUMBER,
  type IBaseTableColumnDefinition,
  type ProcessedIBaseTableColumn,
} from "../IBaseTableInterface";

const buildRenderValue = <T>(
  column: IBaseTableColumnDefinition<T>,
): ((record: T, index: number) => ReactNode) => {
  return (record: T, index: number) => {
    const value = (record as any)[column.key];

    if (column.render) {
      return column.render(value, record, index);
    }

    return value;
  };
};

function processColumn<T>(
  column: IBaseTableColumnDefinition<T>,
): ProcessedIBaseTableColumn<T> {
  const hasChildren =
    Array.isArray(column.children) && column.children.length > 0;

  if (hasChildren) {
    return {
      ...column,
      renderValue: () => null,
      children: column.children!.map((child) => processColumn(child)),
    } as ProcessedIBaseTableColumn<T>;
  }

  const isSpecialKey = [
    I_BASE_TABLE_COLUMN_KEY_ROW_NUMBER,
    I_BASE_TABLE_COLUMN_KEY_ACTION,
  ].includes(column.key);

  const fixedColumns = {
    [I_BASE_TABLE_COLUMN_KEY_ROW_NUMBER]: "left",
    [I_BASE_TABLE_COLUMN_KEY_ACTION]: "right",
  };
  const alignColumns = {
    [I_BASE_TABLE_COLUMN_KEY_ROW_NUMBER]: "center",
    [I_BASE_TABLE_COLUMN_KEY_ACTION]: "center",
  };
  const widthColumns = {
    [I_BASE_TABLE_COLUMN_KEY_ROW_NUMBER]: 80,
    [I_BASE_TABLE_COLUMN_KEY_ACTION]: 80,
  };

  return {
    ...column,
    fixed:
      column.fixed ||
      (fixedColumns[column.key as string] as "left" | "right") ||
      undefined,
    width:
      column.width ||
      (widthColumns[column.key as string] as number) ||
      undefined,
    align:
      column.align ||
      (alignColumns[column.key as string] as "start" | "center" | "end") ||
      undefined,
    renderValue: buildRenderValue(column),
    isResizable: isSpecialKey ? false : column.isResizable,
    isDraggable: isSpecialKey ? false : column.isDraggable,
  } satisfies ProcessedIBaseTableColumn<T>;
}

export const useColumns = <T>(
  columns: IBaseTableColumnDefinition<T>[],
): ProcessedIBaseTableColumn<T>[] => {
  const t = useTranslations("dataTable");

  return useMemo(() => {
    const numberColumn: ProcessedIBaseTableColumn<T> = {
      key: I_BASE_TABLE_COLUMN_KEY_ROW_NUMBER,
      label: t("columns.number"),
      renderValue: (_record: T, index: number) => index + 1,
    };

    const processed = [numberColumn, ...columns].map((col) =>
      processColumn(col),
    );
    return processed;
  }, [columns]);
};

export default useColumns;
