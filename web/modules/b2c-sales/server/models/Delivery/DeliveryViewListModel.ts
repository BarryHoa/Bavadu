import type { Column } from "drizzle-orm";
import { ilike } from "drizzle-orm";

import { BaseViewListModel } from "@base/server/models/BaseViewListModel";
import type {
  ListParamsRequest,
  ListParamsResponse,
} from "@base/server/models/interfaces/ListInterface";
import { table_sales_order_delivery } from "../../schemas";

class DeliveryViewListModel extends BaseViewListModel<
  typeof table_sales_order_delivery,
  any
> {
  constructor() {
    super({
      table: table_sales_order_delivery,
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
      ["id", { column: table_sales_order_delivery.id, sort: true }],
      ["orderType", { column: table_sales_order_delivery.orderType, sort: true }],
      ["orderId", { column: table_sales_order_delivery.orderId, sort: true }],
      ["warehouseId", { column: table_sales_order_delivery.warehouseId, sort: true }],
      ["deliveryDate", { column: table_sales_order_delivery.deliveryDate, sort: true }],
      ["reference", { column: table_sales_order_delivery.reference, sort: true }],
      ["status", { column: table_sales_order_delivery.status, sort: true }],
      ["createdAt", { column: table_sales_order_delivery.createdAt, sort: true }],
      ["updatedAt", { column: table_sales_order_delivery.updatedAt, sort: true }],
    ]);
  }

  protected declarationSearch() {
    return new Map([
      ["reference", (text: string) => ilike(table_sales_order_delivery.reference, text)],
    ]);
  }

  protected declarationFilter() {
    return new Map();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected declarationMappingData(row: any): any {
    return {
      id: row.id,
      orderType: row.orderType,
      orderId: row.orderId,
      warehouseId: row.warehouseId ?? undefined,
      deliveryDate: row.deliveryDate?.getTime(),
      reference: row.reference ?? undefined,
      note: row.note ?? undefined,
      status: row.status,
      createdAt: row.createdAt?.getTime(),
      updatedAt: row.updatedAt?.getTime(),
      createdBy: row.createdBy ?? undefined,
    };
  }

  getData = async (
    params: ListParamsRequest
  ): Promise<ListParamsResponse<any>> => {
    return this.buildQueryDataList(params);
  };
}

export default DeliveryViewListModel;

