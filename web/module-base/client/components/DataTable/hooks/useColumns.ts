import type { CSSProperties, ReactNode } from "react";
import { useMemo } from "react";

import {
  DATA_TABLE_COLUMN_KEY_ROW_NUMBER,
  type DataTableColumnDefinition,
  type ProcessedDataTableColumn,
} from "../DataTableInterface";

type FrozenColumn = {
  key: string;
  offset: number;
  width: number;
};

type FrozenMeta = {
  left: FrozenColumn[];
  right: FrozenColumn[];
};

const computeFrozenMeta = <T>(
  columns: DataTableColumnDefinition<T>[]
): FrozenMeta => {
  const left: FrozenColumn[] = [];
  const right: FrozenColumn[] = [];

  let leftOffset = 0;
  let rightOffset = 0;

  columns.forEach((column) => {
    if (column.fixed === "left") {
      left.push({
        key: column.key,
        offset: leftOffset,
        width: column.width || 150,
      });
      leftOffset += column.width || 150;
    }
  });

  for (let index = columns.length - 1; index >= 0; index -= 1) {
    const column = columns[index];

    if (column.fixed === "right") {
      right.unshift({
        key: column.key,
        offset: rightOffset,
        width: column.width || 150,
      });
      rightOffset += column.width || 150;
    }
  }

  return { left, right };
};

const getFrozenStyle = (
  columnKey: string,
  frozenMeta: FrozenMeta
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
    (column) => column.key === columnKey
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
  frozenMeta: FrozenMeta
): string | undefined => {
  const isLeftFrozen = frozenMeta.left.some(
    (column) => column.key === columnKey
  );
  const isRightFrozen = frozenMeta.right.some(
    (column) => column.key === columnKey
  );

  if (isLeftFrozen) return "frozen-column frozen-left";
  if (isRightFrozen) return "frozen-column frozen-right";

  return undefined;
};

const buildRenderValue = <T>(
  column: DataTableColumnDefinition<T>
): ((record: T, index: number) => ReactNode) => {
  return (record: T, index: number) => {
    const value = (record as any)[column.key];

    if (column.render) {
      return column.render(value, record, index);
    }

    return value;
  };
};

const useColumns = <T>(
  columns: DataTableColumnDefinition<T>[]
): ProcessedDataTableColumn<T>[] => {
  return useMemo(() => {
    const frozenMeta = computeFrozenMeta(columns);

    const numberColumn: ProcessedDataTableColumn<T> = {
      key: DATA_TABLE_COLUMN_KEY_ROW_NUMBER,
      label: "No.",
      width: 64,
      align: "center",
      fixed: "left",
      frozenStyle: getFrozenStyle(DATA_TABLE_COLUMN_KEY_ROW_NUMBER, frozenMeta),
      frozenClassName: getFrozenClassName(
        DATA_TABLE_COLUMN_KEY_ROW_NUMBER,
        frozenMeta
      ),
      renderValue: (_record: T, index: number) => index + 1,
      isResizable: false,
      isDraggable: false,
    };

    const processed = columns.map((column) => {
      const frozenStyle = getFrozenStyle(column.key, frozenMeta);
      const frozenClassName = getFrozenClassName(column.key, frozenMeta);

      // override isResizable and isDraggable for key action

      return {
        ...column,
        frozenStyle,
        frozenClassName,
        renderValue: buildRenderValue(column),
        isResizable: [DATA_TABLE_COLUMN_KEY_ROW_NUMBER, "__action__"].includes(
          column.key
        )
          ? false
          : column.isResizable,
        isDraggable: [DATA_TABLE_COLUMN_KEY_ROW_NUMBER, "__action__"].includes(
          column.key
        )
          ? false
          : column.isDraggable,
      } satisfies ProcessedDataTableColumn<T>;
    });
    return [numberColumn, ...processed];
  }, [columns]);
};

export default useColumns;
