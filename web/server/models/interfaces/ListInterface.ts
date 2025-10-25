import { ParamFilter } from "./FilterInterface";
import { ParamSearch } from "./SearchInterface";
import { ParamSortMultiple } from "./SortInterface";

export type ListParamsRequest<
  F extends ParamFilter = ParamFilter,
  S extends ParamSortMultiple = ParamSortMultiple,
> = {
  offset?: number;
  limit?: number;
  search?: ParamSearch;
  filters?: F;
  sorts?: S;
};
