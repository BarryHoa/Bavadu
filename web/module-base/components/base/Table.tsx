import {
  Table as HeroUITable,
  TableHeader as HeroUITableHeader,
  TableBody as HeroUITableBody,
  TableColumn as HeroUITableColumn,
  TableRow as HeroUITableRow,
  TableCell as HeroUITableCell,
  TableProps,
} from "@heroui/table";

type TableBaseProps = TableProps & {};

const TableBase = (props: TableBaseProps) => {
  return <HeroUITable {...props} />;
};

// Export all table-related components
export const Table = TableBase;
export const TableHeader = HeroUITableHeader;
export const TableBody = HeroUITableBody;
export const TableColumn = HeroUITableColumn;
export const TableRow = HeroUITableRow;
export const TableCell = HeroUITableCell;

export default TableBase;
