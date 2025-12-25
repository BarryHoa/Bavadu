import type { Column } from "drizzle-orm";
import type {
  ListParamsRequest,
  ListParamsResponse,
} from "@base/shared/interface/ListInterface";
import type { ParamFilter } from "@base/shared/interface/FilterInterface";

import { ilike } from "drizzle-orm";
import {
  BaseViewListModel,
  type FilterConditionMap,
} from "@base/server/models/BaseViewListModel";

import { purchase_tb_purchase_orders } from "../../schemas";

class PurchaseOrderViewListModel extends BaseViewListModel<
  typeof purchase_tb_purchase_orders,
  any
> {
  constructor() {
    super({
      table: purchase_tb_purchase_orders,
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
      ["id", { column: purchase_tb_purchase_orders.id, sort: true }],
      ["code", { column: purchase_tb_purchase_orders.code, sort: true }],
      [
        "vendorName",
        { column: purchase_tb_purchase_orders.vendorName, sort: true },
      ],
      ["status", { column: purchase_tb_purchase_orders.status, sort: true }],
      [
        "expectedDate",
        { column: purchase_tb_purchase_orders.expectedDate, sort: true },
      ],
      [
        "warehouseId",
        { column: purchase_tb_purchase_orders.warehouseId, sort: true },
      ],
      [
        "totalAmount",
        { column: purchase_tb_purchase_orders.totalAmount, sort: true },
      ],
      [
        "currency",
        { column: purchase_tb_purchase_orders.currency, sort: true },
      ],
      ["notes", { column: purchase_tb_purchase_orders.notes, sort: false }],
      [
        "createdAt",
        { column: purchase_tb_purchase_orders.createdAt, sort: true },
      ],
      [
        "updatedAt",
        { column: purchase_tb_purchase_orders.updatedAt, sort: true },
      ],
    ]);

  protected declarationSearch = () =>
    new Map([
      ["code", (text: string) => ilike(purchase_tb_purchase_orders.code, text)],
      [
        "vendorName",
        (text: string) => ilike(purchase_tb_purchase_orders.vendorName, text),
      ],
    ]);

  protected declarationFilter = (): FilterConditionMap<ParamFilter> =>
    new Map() as FilterConditionMap<ParamFilter>;

  protected declarationMappingData = (row: any): any => ({
    id: row.id,
    code: row.code,
    vendorName: row.vendorName,
    status: row.status,
    warehouseId: row.warehouseId ?? undefined,
    expectedDate: row.expectedDate?.getTime(),
    totalAmount: row.totalAmount ?? "0",
    currency: row.currency ?? "USD",
    notes: row.notes ?? undefined,
    createdAt: row.createdAt?.getTime(),
    updatedAt: row.updatedAt?.getTime(),
  });

  getData = async (
    params: ListParamsRequest,
  ): Promise<ListParamsResponse<any>> => {
    return this.buildQueryDataList(params);
  };
}

export default PurchaseOrderViewListModel;
