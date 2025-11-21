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
    // 1) Parse list params with sensible defaults
    const {
      offset = 0,
      limit = 10,
      search = undefined,
      filters = undefined,
      sorts = undefined,
    } = params || {};

    // 2) Build base SELECT list from column map
    const selectColumns = Object.fromEntries(
      Array.from(this.columns.entries()).map(([key, config]) => [
        key,
        config.column,
      ])
    );

    // 3) Build base query (SELECT ... FROM ...)
    //    Use `any` for query to avoid Drizzle's complex generic narrowing issues
    //    when conditionally chaining where/orderBy.
    // Use `any` for query to avoid Drizzle's complex generic narrowing issues
    // when conditionally chaining where/orderBy.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const totalResult = "total-data-response" as keyof TRow;
    let query: any = this.db
      .select({
        ...selectColumns,
        [totalResult]: sql<number>`count(*) over()::int`.as("total"),
      })
      .from(this.table as any);

    // 4) Apply global search conditions if configured
    const searchText = isNil(search) ? undefined : String(search).trim();
    const searchExpressions = this.search
      .map((searchTerm) => searchTerm(searchText ?? ""))
      .filter((expr): expr is Exclude<typeof expr, undefined> => Boolean(expr));

    if (searchText && searchExpressions.length > 0) {
      query = query.where(or(...searchExpressions));
    }

    // 5) Allow child model to extend query (joins / where / filters)
    if (callBackBuildQuery) {
      query = callBackBuildQuery(query);
    }

    // 6) Build ORDER BY from `sorts` or fallback to `sortDefault`
    let orderByExpressions =
      sorts
        ?.map((sort) => {
          const sortColumn = this.columns.get(sort.column);
          if (!sortColumn || !sortColumn.sort) {
            return undefined;
          }

          if (sort.direction === "descending") {
            return desc(sortColumn.column);
          }

          return asc(sortColumn.column);
        })
        .filter((expr): expr is ReturnType<typeof asc> => Boolean(expr)) ?? [];

    // Fallback to default sort if no valid sort provided
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
    const total = result.length > 0 ? result[0][totalResult] : 0;

    const data = result.map((row, index) =>
      this.declarationMappingData(row, index)
    );

    return {
      data: data,
      total,
    };
  };

  // Default getData implementation using shared query/mapping logic
  getData = async (
    params: ListParamsRequest<TFilter>
  ): Promise<ListParamsResponse<TRow>> => {
    return await this.buildQueryDataList(params);
  };
}
