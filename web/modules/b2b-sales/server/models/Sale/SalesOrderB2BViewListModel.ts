import type { Column } from "drizzle-orm";
import { ilike } from "drizzle-orm";

import {
  BaseViewListModel,
  type FilterConditionMap,
} from "@base/server/models/BaseViewListModel";
import type {
  ListParamsRequest,
  ListParamsResponse,
} from "@base/server/models/interfaces/ListInterface";
import type { ParamFilter } from "@base/server/models/interfaces/FilterInterface";
import { table_sales_order_b2b } from "../../schemas";

class SalesOrderB2BViewListModel extends BaseViewListModel<
  typeof table_sales_order_b2b,
  any
> {
  constructor() {
    super({
      table: table_sales_order_b2b,
      sortDefault: [
        {
          column: "createdAt",
          direction: "descending",
        },
      ],
    });
  }

  protected declarationColumns = () =>
    new Map<
      string,
      {
        column: Column<any>;
        sort?: boolean;
      }
    >([
      ["id", { column: table_sales_order_b2b.id, sort: true }],
      ["code", { column: table_sales_order_b2b.code, sort: true }],
      ["companyName", { column: table_sales_order_b2b.companyName, sort: true }],
      ["status", { column: table_sales_order_b2b.status, sort: true }],
      ["warehouseId", { column: table_sales_order_b2b.warehouseId, sort: true }],
      ["expectedDate", { column: table_sales_order_b2b.expectedDate, sort: true }],
      ["grandTotal", { column: table_sales_order_b2b.grandTotal, sort: true }],
      ["totalAmount", { column: table_sales_order_b2b.totalAmount, sort: true }],
      ["currency", { column: table_sales_order_b2b.currency, sort: true }],
      ["notes", { column: table_sales_order_b2b.notes, sort: false }],
      ["createdAt", { column: table_sales_order_b2b.createdAt, sort: true }],
      ["updatedAt", { column: table_sales_order_b2b.updatedAt, sort: true }],
    ]);

  protected declarationSearch = () =>
    new Map([
      ["code", (text: string) => ilike(table_sales_order_b2b.code, text)],
      ["companyName", (text: string) => ilike(table_sales_order_b2b.companyName, text)],
    ]);

  protected declarationFilter = (): FilterConditionMap<ParamFilter> =>
    new Map() as FilterConditionMap<ParamFilter>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected declarationMappingData = (row: any): any => ({
    id: row.id,
    code: row.code,
    companyName: row.companyName,
    status: row.status,
    warehouseId: row.warehouseId ?? undefined,
    expectedDate: row.expectedDate?.getTime(),
    grandTotal: row.grandTotal ?? "0",
    totalAmount: row.totalAmount ?? "0",
    currency: row.currency ?? "USD",
    notes: row.notes ?? undefined,
    createdAt: row.createdAt?.getTime(),
    updatedAt: row.updatedAt?.getTime(),
  });

  getData = async (
    params: ListParamsRequest
  ): Promise<ListParamsResponse<any>> => {
    return this.buildQueryDataList(params);
  };
}

export default SalesOrderB2BViewListModel;

