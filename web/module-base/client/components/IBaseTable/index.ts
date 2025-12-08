export { default as useColumns } from "./hooks/useColumns";
export { useIBaseTablePagination } from "./hooks/useIBaseTablePagination";
export { default, default as IBaseTable } from "./IBaseTable";
export { useIBaseTableCore } from "./IBaseTableCore";

export type {
  IBaseTableCoreColumn,
  IBaseTableCoreProps,
  IBaseTableCoreReturn,
} from "./IBaseTableCore";
export type {
  IBaseTableColumnDefinition,
  IBaseTableOnChange,
  IBaseTablePagination,
  IBaseTableProps,
  IBaseTableRowSelection,
  IBaseTableSummary,
  ProcessedIBaseTableColumn,
  RowSelectionMode,
} from "./IBaseTableInterface";
export type { IBaseTableUIProps } from "./IBaseTableUI";

export {
  I_BASE_TABLE_COLUMN_KEY_ACTION,
  I_BASE_TABLE_COLUMN_KEY_ROW_NUMBER,
} from "./IBaseTableInterface";
