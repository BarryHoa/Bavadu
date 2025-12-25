import { IBaseButtonProps } from "@base/client/components";
import type { IBaseTableProps } from "../IBaseTable/IBaseTableInterface";

import { LinkProps } from "@heroui/link";
import { LocaleDataType } from "@base/server";
import { ReactNode } from "react";

import { FilterOption } from "./components/FilterMenu";
import { GroupOption } from "./components/GroupByMenu";

export type ActionElm = {
  key: string;
  title: ReactNode;
  type: "button" | "link";
  color?: IBaseButtonProps["color"];
  variant?: IBaseButtonProps["variant"];
  size?: IBaseButtonProps["size"];
  props?:
    | Omit<IBaseButtonProps, "color" | "variant" | "size">
    | (Omit<LinkProps, "as"> & { hrefAs?: any });
};
export type ViewListDataTableProps<T = any> = Omit<
  IBaseTableProps<T>,
  "dataSource"
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
