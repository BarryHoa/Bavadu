import type {
  ListParamsRequest,
  ListParamsResponse,
} from "./ListInterface";

/**
 * Abstract interface for models that support view list data table functionality
 * This interface defines the contract for models that can provide paginated list data
 */
export interface IBaseViewListModel<
  TRow = any,
  TFilter extends Record<string, any> = Record<string, any>,
> {
  /**
   * Get paginated list data for view data table
   * @param params - List parameters including pagination, search, filters, and sorts
   * @returns Promise resolving to paginated list response
   */
  getViewDataList: (
    params: ListParamsRequest<TFilter>
  ) => Promise<ListParamsResponse<TRow>>;
}

