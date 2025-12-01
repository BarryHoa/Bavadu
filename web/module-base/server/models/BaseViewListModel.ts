import { asc, desc, or, sql, type Column } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import { isNil } from "lodash";
import { BaseModel } from "./BaseModel";
import type {
  ListParamsRequest,
  ListParamsResponse,
} from "./interfaces/ListInterface";
import type { ParamSortMultiple } from "./interfaces/SortInterface";

/**
 * Abstract base class for models that support view list data table functionality
 * Extends BaseModel and implements IBaseViewListModel interface
 *
 * Models that need view list functionality should extend this class
 * and implement the getViewDataList method
 */
type ColumnMap = Map<
  string,
  {
    column: Column<any>;
    sort?: boolean;
  }
>;
type SearchCondition = Array<(text: string) => any>;
type FilterCondition<TFilter extends Record<string, any>> = (
  filters: TFilter | undefined
) => any | undefined;

export abstract class BaseViewListModel<
  TTable extends PgTable<any> = PgTable<any>,
  TRow = any,
  TFilter extends Record<string, any> = Record<string, any>,
> extends BaseModel<TTable> {
  protected readonly columns: ColumnMap;
  protected readonly search: SearchCondition;
  protected readonly filter: Array<FilterCondition<TFilter>>;
  protected readonly sortDefault: ParamSortMultiple;

  constructor({
    table,
    search,
    sortDefault,
  }: {
    table: TTable;
    search?: SearchCondition;
    sortDefault?: ParamSortMultiple;
  }) {
    super(table);
    this.columns = this.declarationColumns();
    this.search = search ?? this.declarationSearch();
    this.filter = this.declarationFilter();
    this.sortDefault = sortDefault ?? [
      {
        column: "createdAt",
        direction: "descending",
      },
    ];
  }

  // ============================================================================
  // ABSTRACT METHODS - Must be implemented by subclasses
  // ============================================================================

  /**
   * Subclass must declare which columns are available for select/sort.
   */
  protected abstract declarationColumns(): ColumnMap;

  /**
   * Subclass must declare how global search text is mapped to conditions.
   * Each function receives the processed search text (may be empty string)
   * and should return a drizzle condition or undefined.
   */
  protected abstract declarationSearch(): SearchCondition;

  /**
   * Optional: subclass can declare how filters are mapped to conditions.
   * Default implementation returns no additional filter conditions.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected abstract declarationFilter(): Array<FilterCondition<TFilter>>;

  /**
   * Subclass must declare how to map a raw DB row to the view row type (TRow)
   * when using shared list/query helpers.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected abstract declarationMappingData(row: any, index: number): TRow;

  // ============================================================================
  // PROTECTED HELPER METHODS
  // ============================================================================

  /**
   * Build a query data list but allows specifying custom select columns/expressions.
   * @param params - List query parameters
   * @param select - Array of columns/expressions or a function (queryBuilder) to customize the select clause
   * @param callBackBuildQuery - Optional callback to extend query (joins / where / filters) after search is applied
   */
  buildQueryDataListWithSelect = async (
    params: ListParamsRequest<TFilter>,
    select: Array<any> | ((qb: typeof this.db) => any),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    callBackBuildQuery?: (query: any) => any
  ): Promise<ListParamsResponse<TRow>> => {
    const {
      filters = undefined,
      search,
      sorts = undefined,
      offset = 0,
      limit = 50,
    } = params;

    // Start with a query builder: allow calling with select clauses
    let query: any;
    if (Array.isArray(select)) {
      query = (this.db.select as any)(...select).from(this.table as any);
    } else if (typeof select === "function") {
      query = select(this.db).from(this.table as any);
    } else {
      query = this.db.select().from(this.table as any);
    }

    // Apply filter, search, etc., as per buildQueryDataList
    // 1. Filter
    const filterConditions = this.filter
      .map((filterFn) => filterFn(filters))
      .filter((expr): expr is Exclude<typeof expr, undefined> => Boolean(expr));

    if (filterConditions.length > 0) {
      query = query.where(...filterConditions);
    }

    // 2. Search
    const searchText = isNil(search) ? undefined : String(search).trim();
    if (searchText) {
      const searchExpressions = this.search
        .map((searchTerm) => searchTerm(searchText))
        .filter((expr): expr is Exclude<typeof expr, undefined> =>
          Boolean(expr)
        );

      if (searchExpressions.length > 0) {
        query = query.where(or(...searchExpressions));
      }
    }

    // 3. Allow child model to extend query (joins / where / filters) via callback
    if (callBackBuildQuery) {
      query = callBackBuildQuery(query);
    }

    // 4. Sort
    let orderByExpressions =
      sorts
        ?.map((sortObj: ParamSortMultiple[number]) => {
          const sortColumn = this.columns.get(sortObj.column);
          if (!sortColumn || !sortColumn.sort) {
            return undefined;
          }
          if (sortObj.direction === "descending") {
            return desc(sortColumn.column);
          }
          return asc(sortColumn.column);
        })
        .filter((expr): expr is ReturnType<typeof asc> => Boolean(expr)) ?? [];

    if (orderByExpressions.length === 0) {
      orderByExpressions = this.sortDefault
        .map((sort) => {
          const sortColumn = this.columns.get(sort.column);
          if (!sortColumn || !sortColumn.sort) {
            return undefined;
          }
          if (sort.direction === "descending") {
            return desc(sortColumn.column);
          }
          return asc(sortColumn.column);
        })
        .filter((expr): expr is ReturnType<typeof asc> => Boolean(expr));
    }

    query = query.orderBy(...orderByExpressions);

    // drizzle select is then-able, so await directly
    const result = (await query.limit(limit).offset(offset)) as any[];
    // Try to determine total if result includes it, otherwise fallback to length
    // Check for both "total-data-response" (from buildQueryDataList) and "totalResult" keys
    const totalResultKey = "total-data-response";
    const total =
      result.length > 0 &&
      (typeof result[0][totalResultKey] !== "undefined" ||
        typeof result[0].totalResult !== "undefined")
        ? (result[0][totalResultKey] ?? result[0].totalResult)
        : result.length;

    const data = result.map((row: any, index: number) =>
      this.declarationMappingData(row, index)
    );

    return {
      data,
      total,
    };
  };

  /**
   * Helper to build paginated list query with common behavior.
   *
   * Sections:
   * 1) Parse list params (offset, limit, search, filters, sorts)
   * 2) Build base SELECT + FROM with columns map
   * 3) Apply global search (this.search) if configured
   * 4) Allow child model to extend query (joins / where / filters) via callback
   * 5) Apply ORDER BY from `sorts` or `sortDefault`
   * 6) Apply LIMIT/OFFSET and return `{ data, total, meta }`
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected buildQueryDataList = async (
    params: ListParamsRequest<TFilter>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    callBackBuildQuery?: (query: any) => any
  ) => {
    // Build base SELECT list from column map with total count
    const selectColumns = Object.fromEntries(
      Array.from(this.columns.entries()).map(([key, config]) => [
        key,
        config.column,
      ])
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const totalResult = "total-data-response" as keyof TRow;
    const selectWithTotal = {
      ...selectColumns,
      [totalResult]: sql<number>`count(*) over()::int`.as("total"),
    };

    // Use buildQueryDataListWithSelect with custom select and callback
    return await this.buildQueryDataListWithSelect(
      params,
      (qb) => qb.select(selectWithTotal),
      callBackBuildQuery
    );
  };

  // ============================================================================
  // PUBLIC METHODS
  // ============================================================================

  /**
   * Default getData implementation using shared query/mapping logic
   */
  getData = async (
    params: ListParamsRequest<TFilter>
  ): Promise<ListParamsResponse<TRow>> => {
    return await this.buildQueryDataList(params);
  };

  /**
   * Override this method to return the options for the dropdown
   */
  getOptionsDropdown = async (
    params: ListParamsRequest<TFilter>
  ): Promise<
    ListParamsResponse<{
      label: string;
      value: string;
      [key: string]: any;
    }>
  > => {
    throw new Error("Method not implemented");
    // return await this.buildQueryDataList(params);
  };
}
