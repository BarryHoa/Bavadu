import type { SortDescriptor, TableProps } from "@heroui/table";
export type { SortDescriptor, TableProps };
import type { CSSProperties, ReactNode } from "react";

export type RowSelectionMode = "single" | "multiple";

export interface IBaseTableRowSelection<T = any> {
  type?: RowSelectionMode;
  selectedRowKeys?: Array<string | number>;
  defaultSelectedRowKeys?: Array<string | number>;
  onChange?: (
    selectedRowKeys: Array<string | number>,
    selectedRows: T[],
  ) => void;
}

export const I_BASE_TABLE_COLUMN_KEY_ACTION = "__action__";
export const I_BASE_TABLE_COLUMN_KEY_ROW_NUMBER = "__row-number__";

export type IBaseTablePagination = {
  pageSize?: number;
  pageSizeOptions?: number[];
  page?: number;
  showTotal?: boolean;
};

export type IBaseTableOnChange = (params: {
  page: number;
  pageSize: number;
  sort?: SortDescriptor;
}) => void;

type IBaseTableClassNames = {
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

export type IBaseTableColumnSortIcon =
  | ReactNode
  | {
      default?: ReactNode;
      ascending?: ReactNode;
      descending?: ReactNode;
    };

export interface IBaseTableColumnDefinition<T = any> {
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
  sortIcon?: IBaseTableColumnSortIcon;
  isResizable?: boolean;
  isDraggable?: boolean;
}

export interface ProcessedIBaseTableColumn<
  T = any,
> extends IBaseTableColumnDefinition<T> {
  frozenStyle?: CSSProperties;
  frozenClassName?: string;
  renderValue: (record: T, index: number) => ReactNode;
}

export interface IBaseTableSummary {
  label?: string;
  values: Record<string, ReactNode>;
}

export type IBaseTableProps<T = any> = TableProps & {
  columns: IBaseTableColumnDefinition<T>[];
  dataSource: T[];
  total?: number;
  rowKey?: string;
  tableLayout?: "auto" | "fixed";
  isResizableColumns?: boolean;
  isDraggableColumns?: boolean;
  isRefreshData?: boolean;
  loading?: boolean;

  pagination?: IBaseTablePagination | false;
  summary?: IBaseTableSummary;
  rowSelection?: IBaseTableRowSelection<T> | false;
  classNames?: IBaseTableClassNames;
  emptyContent?: ReactNode;
  //On change Table
  onChangeTable?: IBaseTableOnChange;
  onRefresh?: () => void;
};
