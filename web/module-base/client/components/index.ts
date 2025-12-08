// Explicit exports to avoid Next.js analyzing all files in the directory
// Backward compatibility: DataTable is now IBaseTable
export { default as DataTable } from "./IBaseTable";
export type {
  IBaseTableColumnDefinition as DataTableColumn,
  IBaseTableColumnDefinition as DataTableColumnDefinition,
  IBaseTableProps as DataTableProps,
  IBaseTableSummary as DataTableSummary,
} from "./IBaseTable/IBaseTableInterface";
export {
  I_BASE_TABLE_COLUMN_KEY_ACTION as DATA_TABLE_COLUMN_KEY_ACTION,
  I_BASE_TABLE_COLUMN_KEY_ROW_NUMBER as DATA_TABLE_COLUMN_KEY_ROW_NUMBER,
} from "./IBaseTable/IBaseTableInterface";

export { default as ViewListDataTable } from "./ViewListDataTable";
export type { FilterOption } from "./ViewListDataTable/components/FilterMenu";
export type { GroupOption } from "./ViewListDataTable/components/GroupByMenu";

// Direct component exports
export { default as AddressPicker } from "./AddressPicker/AddressPicker";
export { default as DatePicker } from "./DatePicker";
export { default as IBaseDigitViewer } from "./IBaseDigitViewer";
export type { IBaseDigitViewerProps } from "./IBaseDigitViewer";
export { default as IBaseInput, default as Input } from "./IBaseInput";
export { default as IBaseInputMultipleLang } from "./IBaseInputMultipleLang";
export { default as IBaseInputNumber } from "./IBaseInputNumber";
export type { IBaseInputNumberProps } from "./IBaseInputNumber";
export { default as IBaseInputSearch } from "./IBaseInputSearch";
export type { IBaseInputSearchProps } from "./IBaseInputSearch";
export {
  default as IBaseModal,
  IBaseModalBody,
  IBaseModalContent,
  IBaseModalFooter,
  IBaseModalHeader,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "./IBaseModal";
export type {
  IBaseModalBodyProps,
  IBaseModalContentProps,
  IBaseModalFooterProps,
  IBaseModalHeaderProps,
  IBaseModalProps,
} from "./IBaseModal";
export {
  default as IBaseSelect,
  default as Select,
  SelectItem,
} from "./IBaseSelect";
export type { IBaseSelectProps, SelectItemOption } from "./IBaseSelect";
export { default as IBaseSingleSelect } from "./IBaseSelect/IBaseSingleSelect";
export { default as IBaseSingleSelectAsync } from "./IBaseSelect/IBaseSingleSelectAsync";
export type {
  FetchOptionsFn,
  FetchOptionsParams,
  IBaseSingleSelectAsyncProps,
} from "./IBaseSelect/IBaseSingleSelectAsync";
export {
  default as IBaseTable,
  useColumns as useIBaseTableColumns,
  useIBaseTableCore,
  useIBaseTablePagination,
} from "./IBaseTable";
export type {
  IBaseTableCoreColumn,
  IBaseTableCoreProps,
  IBaseTableCoreReturn,
} from "./IBaseTable/IBaseTableCore";
export type { IBaseTableProps } from "./IBaseTable/IBaseTableInterface";
export type { IBaseTableUIProps } from "./IBaseTable/IBaseTableUI";
export { default as IBaseTabs, Tab } from "./IBaseTabs";
export type { IBaseTabsProps } from "./IBaseTabs";
export { default as IBaseTextarea, default as Textarea } from "./IBaseTextarea";
export type { IBaseTextareaProps } from "./IBaseTextarea";
export { default as IBaseTooltip } from "./IBaseTooltip";
export * from "./LoadingBar";
export * from "./LoadingOverlay";
export { default as MarkdownContent } from "./MarkdownContent";
export * from "./NavigationLoader";

// Icons and primitives
export * from "./icons";
export * from "./primitives";
