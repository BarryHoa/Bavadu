import type { CSSProperties, ReactNode } from "react";

export const DATA_TABLE_COLUMN_KEY_ACTION = "__action__";
export const DATA_TABLE_COLUMN_KEY_ROW_NUMBER = "__row-number__";

export type DataTableColumnSortIcon =
  | ReactNode
  | {
      default?: ReactNode;
      ascending?: ReactNode;
      descending?: ReactNode;
    };

export interface DataTableColumnDefinition<T = any> {
  key: string;
  title?: ReactNode;
  label?: string;
  dataIndex?: string | string[];
  align?: "start" | "center" | "end";
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  sortable?: boolean;
  fixed?: "left" | "right";
  render?: (value: any, record: T, index: number) => ReactNode;
  sortIcon?: DataTableColumnSortIcon;
  isResizable?: boolean;
  isDraggable?: boolean;
}

export interface ProcessedDataTableColumn<T = any>
  extends DataTableColumnDefinition<T> {
  frozenStyle?: CSSProperties;
  frozenClassName?: string;
  renderValue: (record: T, index: number) => ReactNode;
}
