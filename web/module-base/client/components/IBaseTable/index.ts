import useColumns from "./hooks/useColumns";
import IBaseTable from "./IBaseTable";

export { useColumns };
export { useIBaseTablePagination } from "./hooks/useIBaseTablePagination";
export { IBaseTable };
export { useIBaseTableCore } from "./IBaseTableCore";
export {
  IBaseTablePrimitive,
  IBaseTableBody,
  IBaseTableCell,
  IBaseTableColumn,
  IBaseTableHeader,
  IBaseTableRow,
} from "./components/TablePrimitives";

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

export default IBaseTable;
