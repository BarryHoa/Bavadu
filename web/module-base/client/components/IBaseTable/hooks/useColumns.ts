import type { CSSProperties, ReactNode } from "react";

import { useMemo } from "react";
import { useTranslations } from "next-intl";

import {
  I_BASE_TABLE_COLUMN_KEY_ROW_NUMBER,
  type IBaseTableColumnDefinition,
  type ProcessedIBaseTableColumn,
} from "../IBaseTableInterface";

type FrozenColumn = {
  key: string;
  offset: number;
  width: number;
};

type FrozenMeta = {
  left: FrozenColumn[];
  right: FrozenColumn[];
};

/** Flatten column tree to leaf columns only. */
function flattenLeafColumns<T>(
  columns: IBaseTableColumnDefinition<T>[],
): IBaseTableColumnDefinition<T>[] {
  const out: IBaseTableColumnDefinition<T>[] = [];
  for (const col of columns) {
    if (Array.isArray(col.children) && col.children.length > 0) {
      out.push(...flattenLeafColumns(col.children));
    } else {
      out.push(col);
    }
  }
  return out;
}

const computeFrozenMeta = <T>(
  leafColumns: IBaseTableColumnDefinition<T>[],
): FrozenMeta => {
  let leftOffset = 0;
  let rightOffset = 0;

  const leftColumns = leafColumns.filter((c) => c.fixed === "left");
  const left = leftColumns.map((column) => {
    const frozen: FrozenColumn = {
      key: column.key,
      offset: leftOffset,
      width: column.width || 150,
    };
    leftOffset += column.width || 150;
    return frozen;
  });

  const rightColumns = leafColumns
    .slice()
    .reverse()
    .filter((c) => c.fixed === "right");
  const right = rightColumns
    .map((column) => {
      const frozen: FrozenColumn = {
        key: column.key,
        offset: rightOffset,
        width: column.width || 150,
      };
      rightOffset += column.width || 150;
      return frozen;
    })
    .reverse();

  return { left, right };
};

const getFrozenStyle = (
  columnKey: string,
  frozenMeta: FrozenMeta,
): CSSProperties | undefined => {
  const leftColumn = frozenMeta.left.find((column) => column.key === columnKey);

  if (leftColumn) {
    return {
      position: "sticky",
      left: leftColumn.offset,
      zIndex: 10,
    };
  }

  const rightColumn = frozenMeta.right.find(
    (column) => column.key === columnKey,
  );

  if (rightColumn) {
    return {
      position: "sticky",
      right: rightColumn.offset,
      zIndex: 10,
    };
  }

  return undefined;
};

const getFrozenClassName = (
  columnKey: string,
  frozenMeta: FrozenMeta,
): string | undefined => {
  const isLeftFrozen = frozenMeta.left.some(
    (column) => column.key === columnKey,
  );
  const isRightFrozen = frozenMeta.right.some(
    (column) => column.key === columnKey,
  );

  if (isLeftFrozen) return "frozen-column frozen-left";
  if (isRightFrozen) return "frozen-column frozen-right";

  return undefined;
};

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
  frozenMeta: FrozenMeta,
): ProcessedIBaseTableColumn<T> {
  const hasChildren =
    Array.isArray(column.children) && column.children.length > 0;

  if (hasChildren) {
    return {
      ...column,
      renderValue: () => null,
      children: column.children!.map((child) =>
        processColumn(child, frozenMeta),
      ),
    } as ProcessedIBaseTableColumn<T>;
  }

  const frozenStyle = getFrozenStyle(column.key, frozenMeta);
  const frozenClassName = getFrozenClassName(column.key, frozenMeta);
  const isSpecialKey = [
    I_BASE_TABLE_COLUMN_KEY_ROW_NUMBER,
    "__action__",
  ].includes(column.key);

  return {
    ...column,
    frozenStyle,
    frozenClassName,
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
    const leafColumns = flattenLeafColumns(columns);
    const frozenMeta = computeFrozenMeta(leafColumns);

    const numberColumn: ProcessedIBaseTableColumn<T> = {
      key: I_BASE_TABLE_COLUMN_KEY_ROW_NUMBER,
      label: t("columns.number"),
      width: 64,
      align: "center",
      fixed: "left",
      frozenStyle: getFrozenStyle(
        I_BASE_TABLE_COLUMN_KEY_ROW_NUMBER,
        frozenMeta,
      ),
      frozenClassName: getFrozenClassName(
        I_BASE_TABLE_COLUMN_KEY_ROW_NUMBER,
        frozenMeta,
      ),
      renderValue: (_record: T, index: number) => index + 1,
      isResizable: false,
      isDraggable: false,
    };

    const processed = columns.map((col) => processColumn(col, frozenMeta));
    return [numberColumn, ...processed] as ProcessedIBaseTableColumn<T>[];
  }, [columns, t]);
};

export default useColumns;
