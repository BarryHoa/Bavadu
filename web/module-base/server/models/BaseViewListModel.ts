import { asc, desc, or, sql, type Column } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import { isNil, omitBy } from "lodash";
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
type SearchConditionMap = Map<string, (text: string) => any>;
type FilterCondition<TFilter extends Record<string, any>> = (
  currentFilterValue: any,
  filters: TFilter | undefined
) => any | undefined;
type FilterConditionMap<TFilter extends Record<string, any>> = Map<
  string,
  FilterCondition<TFilter>
>;

export abstract class BaseViewListModel<
  TTable extends PgTable<any> = PgTable<any>,
  TRow = any,
  TFilter extends Record<string, any> = Record<string, any>,
> extends BaseModel<TTable> {
  protected readonly columns: ColumnMap;
  protected readonly search: SearchConditionMap;
  protected readonly filter: FilterConditionMap<TFilter>;
  protected readonly sortDefault: ParamSortMultiple;

  constructor({
    table,
    search,
    sortDefault,
  }: {
    table: TTable;
    search?: SearchConditionMap;
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
  // PROTECTED METHODS - Can be overridden by subclasses
  // ============================================================================

  /**
   * Declare which columns are available for select/sort.
   * Default implementation returns an empty Map.
   * Subclass can override to provide columns mapping.
   */
  protected declarationColumns(): ColumnMap {
    return new Map();
  }

  /**
   * Declare how global search text is mapped to conditions.
   * Returns a Map where key is the search field name and value is a function
   * that receives the processed search text (may be empty string)
   * and should return a drizzle condition or undefined.
   * Default implementation returns an empty Map (no search).
   * Subclass can override to provide search conditions.
   */
  protected declarationSearch(): SearchConditionMap {
    return new Map();
  }

  /**
   * Declare how filters are mapped to conditions.
   * Returns a Map where key is the filter field name and value is a function
   * that receives the filters object and returns a drizzle condition or undefined.
   * Default implementation returns an empty Map (no additional filters).
   * Subclass can override to provide filter conditions.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected declarationFilter(): FilterConditionMap<TFilter> {
    return new Map();
  }

  /**
   * Declare how to map a raw DB row to the view row type (TRow)
   * when using shared list/query helpers.
   * Default implementation returns the row as-is.
   * Subclass can override to transform the row data.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected declarationMappingData(row: any, index?: number): TRow {
    return row as TRow;
  }

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
    select?: Record<string, Column<any>>,
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const totalResultKey = "total-data-response" as keyof TRow;

    // Start with a query builder: allow calling with select clauses
    let query: any;
    switch (typeof select) {
      case "object":
        {
          const selectWithTotal = {
            ...select,
            [totalResultKey]: sql<number>`count(*) over()::int`.as("total"),
          };
          query = this.db.select(selectWithTotal).from(this.table as any);
        }
        break;

      default:
        {
          const selectWithTotal = {
            ...this.table, // select all columns (i.e., SELECT *)
            [totalResultKey]: sql<number>`count(*) over()::int`.as("total"),
          };
          query = this.db.select(selectWithTotal).from(this.table as any);
        }
        break;
    }

    // Apply filter, search, etc., as per buildQueryDataList
    // 1. Filter

    // Lọc những key của filter có trong map this.filter
    const filterKeys =
      filters && typeof filters === "object" ? Object.keys(filters) : [];
    const validFilterKeys = filterKeys.filter((key) => this.filter.has(key));
    const filterConditionsByKeys = validFilterKeys
      .map((key) => {
        const filterFn = this.filter.get(key);
        const filterValue = filters?.[key];

        return filterFn ? filterFn(filterValue, filters) : undefined;
      })
      .filter((expr): expr is Exclude<typeof expr, undefined> => Boolean(expr));

    if (filterConditionsByKeys.length > 0) {
      query = query.where(...filterConditionsByKeys);
    }

    // 2. Search
    const searchText = isNil(search) ? undefined : String(search).trim();
    if (searchText) {
      const searchExpressions = Array.from(this.search.values())
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

    const total = result?.[0]?.[totalResultKey] ?? 0;
    const data = result?.map((row: any) =>
      omitBy(row, totalResultKey)
    ) as TRow[];

    return { data, total };
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

    // Use buildQueryDataListWithSelect with custom select and callback
    const result = await this.buildQueryDataListWithSelect(
      params,
      selectColumns as Record<string, never>,
      callBackBuildQuery
    );
    return {
      data:
        result?.data?.map((row: any, index: number) =>
          this.declarationMappingData(row, index)
        ) ?? [],
      total: result?.total ?? 0,
    };
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
}
