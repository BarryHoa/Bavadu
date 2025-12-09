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
import { table_sales_order_b2c } from "../../schemas";

class SalesOrderB2CViewListModel extends BaseViewListModel<
  typeof table_sales_order_b2c,
  any
> {
  constructor() {
    super({
      table: table_sales_order_b2c,
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
      ["id", { column: table_sales_order_b2c.id, sort: true }],
      ["code", { column: table_sales_order_b2c.code, sort: true }],
      ["customerName", { column: table_sales_order_b2c.customerName, sort: true }],
      ["status", { column: table_sales_order_b2c.status, sort: true }],
      ["warehouseId", { column: table_sales_order_b2c.warehouseId, sort: true }],
      ["expectedDate", { column: table_sales_order_b2c.expectedDate, sort: true }],
      ["grandTotal", { column: table_sales_order_b2c.grandTotal, sort: true }],
      ["totalAmount", { column: table_sales_order_b2c.totalAmount, sort: true }],
      ["currency", { column: table_sales_order_b2c.currency, sort: true }],
      ["completedAt", { column: table_sales_order_b2c.completedAt, sort: true }],
      ["notes", { column: table_sales_order_b2c.notes, sort: false }],
      ["createdAt", { column: table_sales_order_b2c.createdAt, sort: true }],
      ["updatedAt", { column: table_sales_order_b2c.updatedAt, sort: true }],
    ]);

  protected declarationSearch = () =>
    new Map([
      ["code", (text: string) => ilike(table_sales_order_b2c.code, text)],
      ["customerName", (text: string) => ilike(table_sales_order_b2c.customerName, text)],
    ]);

  protected declarationFilter = (): FilterConditionMap<ParamFilter> =>
    new Map() as FilterConditionMap<ParamFilter>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected declarationMappingData = (row: any): any => ({
    id: row.id,
    code: row.code,
    customerName: row.customerName,
    status: row.status,
    warehouseId: row.warehouseId ?? undefined,
    expectedDate: row.expectedDate?.getTime(),
    grandTotal: row.grandTotal ?? "0",
    totalAmount: row.totalAmount ?? "0",
    currency: row.currency ?? "USD",
    completedAt: row.completedAt?.getTime(),
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

export default SalesOrderB2CViewListModel;

