import { Param } from "drizzle-orm";
import { ParamSearch } from "./SearchInterface";
import { ParamFilter } from "./FilterInterface";
import { ParamSortMultiple } from "./SortInterface";

export type ListParamsRequest<F extends ParamFilter = ParamFilter, S extends ParamSortMultiple = ParamSortMultiple> = {
    offset?: number;
    limit?: number;
    search?: ParamSearch;
    filters?: F;
    sorts?: S;
}