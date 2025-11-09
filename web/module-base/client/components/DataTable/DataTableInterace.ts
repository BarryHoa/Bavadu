import type { CSSProperties, ReactNode } from "react";

export interface DataTableColumnDefinition<T = any> {
  key: string;
  title?: ReactNode;
  label?: string;
  dataIndex?: string | string[];
  align?: "start" | "center" | "end";
  width?: number;
  sortable?: boolean;
  fixed?: "left" | "right";
  render?: (value: any, record: T, index: number) => ReactNode;
}

export interface ProcessedDataTableColumn<T = any>
  extends DataTableColumnDefinition<T> {
  frozenStyle?: CSSProperties;
  frozenClassName?: string;
  renderValue: (record: T, index: number) => ReactNode;
}

export interface DataTableSortDescriptor<T = any> {
  column?: keyof T;
  direction?: "ascending" | "descending";
}
