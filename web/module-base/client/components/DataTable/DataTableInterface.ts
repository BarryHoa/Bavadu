import type { TableProps } from "@heroui/table";
import type { CSSProperties, ReactNode } from "react";

import type { DataTableRowSelection } from "./hooks/useDataTableSelection";

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

export interface DataTableSummary {
  label?: string;
  values: Record<string, ReactNode>;
}

type DataTablePagination = {
  pageSize?: number;
  pageSizeOptions?: number[];
  page?: number;
  showTotal?: boolean;
};
type DataTableOnChange = (params: {
  page: number;
  pageSize: number;
  sortColumn?: string;
  sortDirection?: "ascending" | "descending";
}) => void;
type DataTableClassNames = {
  wrapper?: string;
  table?: string;
  thead?: string;
  tbody?: string;
  tr?: string;
  th?: string;
  td?: string;
  footer?: string;
  pagination?: string;
};

export type DataTableProps<T = any> = TableProps & {
  columns: DataTableColumnDefinition<T>[];
  dataSource: T[];
  total?: number;
  rowKey?: string;
  tableLayout?: "auto" | "fixed";
  isResizableColumns?: boolean;
  isDraggableColumns?: boolean;
  isRefreshData?: boolean;
  loading?: boolean;

  pagination?: DataTablePagination | false;
  summary?: DataTableSummary;
  rowSelection?: DataTableRowSelection<T> | false;
  classNames?: DataTableClassNames;
  emptyContent?: ReactNode;
  //On change Table
  onChangeTable?: DataTableOnChange;
};
