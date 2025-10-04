export type SortDirection = 'asc' | 'desc';
export type ParamSortSingle = {
    field: string;
    direction: SortDirection;
}
export type ParamSortMultiple  = Array<ParamSortSingle>