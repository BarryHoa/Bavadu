import type { CSSProperties, ReactNode } from "react";

export interface DataTableColumnDefinition<T = any> {
  key: string;
  label: string;
  align?: "start" | "center" | "end";
  width?: number;
  sortable?: boolean;
  render?: (value: any, record: T, index: number) => ReactNode;
  fixed?: "left" | "right";
}

export interface ProcessedDataTableColumn<T = any>
  extends DataTableColumnDefinition<T> {
  frozenStyle?: CSSProperties;
  frozenClassName?: string;
  renderValue: (record: T, index: number) => ReactNode;
}
