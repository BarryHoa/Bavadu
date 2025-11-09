import { LocaleDataType } from "@/module-base/server";
import { DataTableProps } from "../DataTable/DataTable";
import { FilterOption } from "./components/FilterMenu";
import { GroupOption } from "./components/GroupByMenu";

export type ViewListDataTableProps<T = any> = Omit<
  DataTableProps<T>,
  "pagination" | "dataSource"
> & {
  title?: LocaleDataType<string> | string;
  model: string; // @module.model format (e.g., "product.variant")
  // Optional: Override fetched data
  dataSource?: T[];
  // Optional: Override fetched filter options
  filterOptions?: FilterOption<T>[];
  // Optional: Override fetched group by options
  groupByOptions?: GroupOption[];
  // Optional: Override fetched favorite filter
  initialFavoriteFilter?: (row: T) => boolean;
  search?: {
    hidden?: boolean;
    placeholder?: string;
  };
  filter?: {
    hidden?: boolean;
  };
  groupBy?: {
    hidden?: boolean;
  };
  favorite?: {
    hidden?: boolean;
  };
  columnVisibility?: {
    hidden?: boolean;
  };
  isDummyData?: boolean;
};
