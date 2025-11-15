import type { PgTable } from "drizzle-orm/pg-core";
import { BaseModel } from "./BaseModel";
import type { IBaseViewListModel } from "./interfaces/IBaseViewListModel";
import type {
  ListParamsRequest,
  ListParamsResponse,
} from "./interfaces/ListInterface";

/**
 * Abstract base class for models that support view list data table functionality
 * Extends BaseModel and implements IBaseViewListModel interface
 *
 * Models that need view list functionality should extend this class
 * and implement the getViewDataList method
 */
export abstract class BaseViewListModel<
    TTable extends PgTable<any> = PgTable<any>,
    TRow = any,
    TFilter extends Record<string, any> = Record<string, any>,
  >
  extends BaseModel<TTable>
  implements IBaseViewListModel<TRow, TFilter>
{
  constructor(table: TTable) {
    super(table);
  }

  /**Get default parameters for list */
  getDefaultParamsForList = (params?: ListParamsRequest<TFilter>) => {
    const { offset, limit, search, filters, sorts } = params || {};
    return {
      offset: offset || 0,
      limit: limit || 10,
      search: search || undefined,
      filters: filters || undefined,
      sorts: sorts || undefined,
    };
  };

  /**Get pagination data */
  getPagination = (options: { data?: any; total?: number }) => {
    const { data, total = 0 } = options;

    return {
      data,
      total,
    };
  };

  /**
   * Abstract method that must be implemented by subclasses
   * Get paginated list data for view data table
   *
   * @param params - List parameters including pagination, search, filters, and sorts
   * @returns Promise resolving to paginated list response
   */
  abstract getViewDataList(
    params: ListParamsRequest<TFilter>
  ): Promise<ListParamsResponse<TRow>>;
}
