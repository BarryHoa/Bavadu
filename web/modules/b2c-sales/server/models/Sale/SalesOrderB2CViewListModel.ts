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
import { sale_b2c_tb_orders } from "../../schemas";

class SalesOrderB2CViewListModel extends BaseViewListModel<
  typeof sale_b2c_tb_orders,
  any
> {
  constructor() {
    super({
      table: sale_b2c_tb_orders,
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
      ["id", { column: sale_b2c_tb_orders.id, sort: true }],
      ["code", { column: sale_b2c_tb_orders.code, sort: true }],
      ["customerName", { column: sale_b2c_tb_orders.customerName, sort: true }],
      ["status", { column: sale_b2c_tb_orders.status, sort: true }],
      ["warehouseId", { column: sale_b2c_tb_orders.warehouseId, sort: true }],
      ["expectedDate", { column: sale_b2c_tb_orders.expectedDate, sort: true }],
      ["grandTotal", { column: sale_b2c_tb_orders.grandTotal, sort: true }],
      ["totalAmount", { column: sale_b2c_tb_orders.totalAmount, sort: true }],
      ["currency", { column: sale_b2c_tb_orders.currency, sort: true }],
      ["completedAt", { column: sale_b2c_tb_orders.completedAt, sort: true }],
      ["notes", { column: sale_b2c_tb_orders.notes, sort: false }],
      ["createdAt", { column: sale_b2c_tb_orders.createdAt, sort: true }],
      ["updatedAt", { column: sale_b2c_tb_orders.updatedAt, sort: true }],
    ]);

  protected declarationSearch = () =>
    new Map([
      ["code", (text: string) => ilike(sale_b2c_tb_orders.code, text)],
      ["customerName", (text: string) => ilike(sale_b2c_tb_orders.customerName, text)],
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

