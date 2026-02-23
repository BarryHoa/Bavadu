import type { ParamFilter } from "@base/shared/interface/FilterInterface";
import type {
  ListParamsRequest,
  ListParamsResponse,
} from "@base/shared/interface/ListInterface";
import type { ParamSortMultiple } from "@base/shared/interface/SortInterface";
import type { PgTable } from "drizzle-orm/pg-core";

import { asc, desc, or, sql, type Column } from "drizzle-orm";
import { isNil, omitBy } from "lodash";

import { BaseModel } from "./BaseModel";

/**
 * Abstract base class for models that support view list data table functionality
 * Extends BaseModel and implements IBaseViewListModel interface
 *
 * Models that need view list functionality should extend this class
 * and implement the getViewDataList method
 */
export type ColumnMap = Map<
  string,
  {
    column: Column;
    sort?: boolean;
  }
>;
export type SearchConditionMap = Map<string, (text: string) => unknown>;
export type FilterCondition<TFilter extends ParamFilter> = (
  currentFilterValue?: unknown,
  filters?: TFilter | undefined,
) => unknown | undefined;
export type FilterConditionMap<TFilter extends ParamFilter> = Map<
  string,
  FilterCondition<TFilter>
>;

export abstract class BaseViewListModel<
  TTable extends PgTable = PgTable,
  TRow = unknown,
  TFilter extends ParamFilter = ParamFilter,
> extends BaseModel<TTable> {
  private _columns?: ColumnMap;
  private _search?: SearchConditionMap;
  private _filter?: FilterConditionMap<TFilter>;
  private _sortDefault?: ParamSortMultiple;
  private readonly _sortDefaultOverride?: ParamSortMultiple;

  constructor({
    table,
    sortDefault,
  }: {
    table: TTable;
    sortDefault?: ParamSortMultiple;
  }) {
    super(table);
    this._sortDefaultOverride = sortDefault;
  }

  // Lazy getters that call overridden methods when first accessed
  protected get columns(): ColumnMap {
    if (!this._columns) {
      this._columns = this.declarationColumns();
    }

    return this._columns;
  }

  protected get search(): SearchConditionMap {
    if (!this._search) {
      this._search = this.declarationSearch();
    }

    return this._search;
  }

  protected get filter(): FilterConditionMap<TFilter> {
    if (!this._filter) {
      this._filter = this.declarationFilter();
    }

    return this._filter;
  }

  protected get sortDefault(): ParamSortMultiple {
    if (!this._sortDefault) {
      this._sortDefault = this._sortDefaultOverride ?? [
        {
          column: "createdAt",
          direction: "descending",
        },
      ];
    }

    return this._sortDefault;
  }

  // ============================================================================
  // PROTECTED METHODS - Can be overridden by subclasses
  // ============================================================================

  /**
   * Declare which columns are available for select/sort.
   * Default implementation returns an empty Map.
   * Subclass can override to provide columns mapping.
   */
  protected declarationColumns = (): ColumnMap => {
    return new Map();
  };

  /**
   * Declare how global search text is mapped to conditions.
   * Returns a Map where key is the search field name and value is a function
   * that receives the processed search text (may be empty string)
   * and should return a drizzle condition or undefined.
   * Default implementation returns an empty Map (no search).
   * Subclass can override to provide search conditions.
   */
  protected declarationSearch = (): SearchConditionMap => {
    return new Map();
  };

  /**
   * Declare how filters are mapped to conditions.
   * Returns a Map where key is the filter field name and value is a function
   * that receives the filters object and returns a drizzle condition or undefined.
   * Default implementation returns an empty Map (no additional filters).
   * Subclass can override to provide filter conditions.
   */

  protected declarationFilter = (): FilterConditionMap<TFilter> => {
    return new Map();
  };

  /**
   * Declare how to map a raw DB row to the view row type (TRow)
   * when using shared list/query helpers.
   * Default implementation returns the row as-is.
   * Subclass can override to transform the row data.
   */
  protected declarationMappingData = (row: unknown, index?: number): TRow => {
    return row as TRow;
  };

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
    select?: Record<string, Column>,
    callBackBuildQuery?: (query: any) => any,
  ): Promise<ListParamsResponse<TRow>> => {
    const {
      filters = undefined,
      search,
      sorts = undefined,
      offset = 0,
      limit = 50,
    } = params;

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

          query = this.db
            .select(selectWithTotal as any)
            .from(this.table as any);
        }
        break;

      default:
        {
          const selectWithTotal = {
            ...this.table, // select all columns (i.e., SELECT *)
            [totalResultKey]: sql<number>`count(*) over()::int`.as("total"),
          };

          query = this.db
            .select(selectWithTotal as any)
            .from(this.table as any);
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
          Boolean(expr),
        );

      if (searchExpressions.length > 0) {
        console.log("searchExpressions", searchExpressions);
        console.log("searchText", searchText);

        query = query.where(or(...(searchExpressions as any[])) as any);
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

    // console.log(query.toSQL());

    // drizzle select is then-able, so await directly
    const result = (await query.limit(limit).offset(offset)) as Array<
      Record<string, unknown>
    >;

    // Try to determine total if result includes it, otherwise fallback to length
    // Check for both "total-data-response" (from buildQueryDataList) and "totalResult" keys

    const total = (result?.[0]?.[totalResultKey as string] as number) ?? 0;
    const data = result?.map((row) =>
      omitBy(row, totalResultKey as string),
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
  protected buildQueryDataList = async (
    params: ListParamsRequest<TFilter>,

    callBackBuildQuery?: (query: any) => any,
  ) => {
    // Build base SELECT list from column map with total count
    const selectColumns = Object.fromEntries(
      Array.from(this.columns.entries()).map(([key, config]) => [
        key,
        config.column,
      ]),
    );

    // Use buildQueryDataListWithSelect with custom select and callback
    const result = await this.buildQueryDataListWithSelect(
      params,
      selectColumns as Record<string, Column>,
      callBackBuildQuery,
    );

    return {
      data:
        result?.data?.map((row, index) =>
          this.declarationMappingData(row, index),
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
    params: ListParamsRequest<TFilter>,
  ): Promise<ListParamsResponse<TRow>> => {
    return await this.buildQueryDataList(params);
  };
}
