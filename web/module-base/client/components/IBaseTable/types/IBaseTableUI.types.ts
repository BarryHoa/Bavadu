import type { SortDescriptor, TableProps } from "@heroui/table";
import type { Column, Header, HeaderGroup, Row } from "@tanstack/react-table";
import type { ReactNode } from "react";

import {
  IBaseTableScrollHeight,
  IBaseTableScrollWidth,
} from "../IBaseTableInterface";

export type { SortDescriptor };

export interface IBaseTableUIClassNames {
  wrapper?: string;
  table?: string;
  thead?: string;
  tbody?: string;
  tr?: string;
  th?: string;
  td?: string;
}

/** Props for the table UI layer (receives data + callbacks from core). */
export interface IBaseTableUIProps<T = any> {
  headerGroups: HeaderGroup<T>[];
  rows: Row<T>[];
  columns: Column<T, unknown>[];

  loading?: boolean;
  emptyContent?: ReactNode;
  classNames?: IBaseTableUIClassNames;
  tableLayout?: "auto" | "fixed";
  scrollHeight?: IBaseTableScrollHeight;
  scrollWidth?: IBaseTableScrollWidth;
  color?: TableProps["color"];
  isStriped?: boolean;
  isCompact?: boolean;
  isHeaderSticky?: boolean;

  selectionMode?: TableProps["selectionMode"];
  selectedKeys?: TableProps["selectedKeys"];
  onSelectionChange?: TableProps["onSelectionChange"];

  sortDescriptor?: SortDescriptor;
  onSortChange?: (sort: SortDescriptor) => void;

  enableColumnResizing?: boolean;
  enableColumnOrdering?: boolean;
  columnOrder?: string[];
  onColumnOrderChange?: (order: string[]) => void;
  setColumnOrder?: (updater: string[] | ((prev: string[]) => string[])) => void;

  getRowKey: (record: T, index: number) => string;
  renderCell?: (
    column: Column<T, unknown>,
    row: Row<T>,
    value: unknown,
  ) => ReactNode;
  renderHeader?: (
    header: HeaderGroup<T>,
    column: Column<T, unknown>,
  ) => ReactNode;
}

export interface TableHeaderCellProps<T = any> {
  header: Header<T, unknown>;
  column: Column<T, unknown>;
  meta: Record<string, unknown>;
  isSortable: boolean;
  getSortIcon: (columnId: string) => ReactNode;
  onHeaderClick: (column: Column<T, unknown>) => void;
  enableColumnResizing: boolean;
  enableColumnOrdering: boolean;
  renderHeader?: (
    header: HeaderGroup<T>,
    column: Column<T, unknown>,
  ) => ReactNode;
  headerGroup: HeaderGroup<T>;
}
