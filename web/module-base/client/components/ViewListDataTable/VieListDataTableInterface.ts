import { LocaleDataType } from "@base/server";
import { ButtonProps, LinkProps } from "@heroui/react";
import { ReactNode } from "react";
import type { DataTableProps } from "../DataTable/DataTableInterface";
import { FilterOption } from "./components/FilterMenu";
import { GroupOption } from "./components/GroupByMenu";

export type ActionElm = {
  key: string;
  title: ReactNode;
  type: "button" | "link";
  color?: ButtonProps["color"];
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  props?:
    | Omit<ButtonProps, "color" | "variant" | "size">
    | (Omit<LinkProps, "as"> & { hrefAs?: any });
};
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

  // others actions
  actionsLeft?: ActionElm[];
  actionsRight?: ActionElm[];
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
