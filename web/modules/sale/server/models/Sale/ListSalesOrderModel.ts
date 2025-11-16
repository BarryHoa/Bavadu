import type { Column } from "drizzle-orm";
import { ilike } from "drizzle-orm";

import { BaseViewListModel } from "@base/server/models/BaseViewListModel";
import type {
  ListParamsRequest,
  ListParamsResponse,
} from "@base/server/models/interfaces/ListInterface";
import {
  table_sales_order,
} from "../../schemas";

class ListSalesOrderModel extends BaseViewListModel<
  typeof table_sales_order,
  any
> {
  constructor() {
    super({
      table: table_sales_order,
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
      ["id", { column: table_sales_order.id, sort: true }],
      ["code", { column: table_sales_order.code, sort: true }],
      [
        "customerName",
        { column: table_sales_order.customerName, sort: true },
      ],
      ["status", { column: table_sales_order.status, sort: true }],
      [
        "warehouseId",
        { column: table_sales_order.warehouseId, sort: true },
      ],
      [
        "expectedDate",
        { column: table_sales_order.expectedDate, sort: true },
      ],
      [
        "totalAmount",
        { column: table_sales_order.totalAmount, sort: true },
      ],
      ["currency", { column: table_sales_order.currency, sort: true }],
      ["notes", { column: table_sales_order.notes, sort: false }],
      [
        "createdAt",
        { column: table_sales_order.createdAt, sort: true },
      ],
      [
        "updatedAt",
        { column: table_sales_order.updatedAt, sort: true },
      ],
    ]);
  }

  protected declarationSearch() {
    return [
      (text: string) => ilike(table_sales_order.code, text),
      (text: string) => ilike(table_sales_order.customerName, text),
    ];
  }

  protected declarationFilter() {
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected declarationMappingData(row: any): any {
    return {
      id: row.id,
      code: row.code,
      customerName: row.customerName,
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

export default ListSalesOrderModel;

