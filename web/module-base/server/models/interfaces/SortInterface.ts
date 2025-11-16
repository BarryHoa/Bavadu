export type SortDirection = "ascending" | "descending";
export type ParamSortSingle = {
  column: string;
  direction?: SortDirection;
};
export type ParamSortMultiple = Array<ParamSortSingle>;
