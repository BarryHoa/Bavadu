import type { Column } from "drizzle-orm";
import { ilike } from "drizzle-orm";

import { BaseViewListModel } from "@base/server/models/BaseViewListModel";
import type {
  ListParamsRequest,
  ListParamsResponse,
} from "@base/server/models/interfaces/ListInterface";
import { table_purchase_order } from "../../schemas";

class PurchaseOrderViewListModel extends BaseViewListModel<
  typeof table_purchase_order,
  any
> {
  constructor() {
    super({
      table: table_purchase_order,
      sortDefault: [
        {
          column: "createdAt",
          direction: "descending",
        },
      ],
    });
  }

  protected declarationColumns() {
    return new Map<
      string,
      {
        column: Column<any>;
        sort?: boolean;
      }
    >([
      ["id", { column: table_purchase_order.id, sort: true }],
      ["code", { column: table_purchase_order.code, sort: true }],
      [
        "vendorName",
        { column: table_purchase_order.vendorName, sort: true },
      ],
      ["status", { column: table_purchase_order.status, sort: true }],
      [
        "expectedDate",
        { column: table_purchase_order.expectedDate, sort: true },
      ],
      [
        "warehouseId",
        { column: table_purchase_order.warehouseId, sort: true },
      ],
      [
        "totalAmount",
        { column: table_purchase_order.totalAmount, sort: true },
      ],
      ["currency", { column: table_purchase_order.currency, sort: true }],
      ["notes", { column: table_purchase_order.notes, sort: false }],
      [
        "createdAt",
        { column: table_purchase_order.createdAt, sort: true },
      ],
      [
        "updatedAt",
        { column: table_purchase_order.updatedAt, sort: true },
      ],
    ]);
  }

  protected declarationSearch() {
    return new Map([
      ["code", (text: string) => ilike(table_purchase_order.code, text)],
      ["vendorName", (text: string) => ilike(table_purchase_order.vendorName, text)],
    ]);
  }

  protected declarationFilter() {
    return new Map();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected declarationMappingData(row: any): any {
    return {
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
    };
  }

  getData = async (
    params: ListParamsRequest
  ): Promise<ListParamsResponse<any>> => {
    return this.buildQueryDataList(params);
  };
}

export default PurchaseOrderViewListModel;
