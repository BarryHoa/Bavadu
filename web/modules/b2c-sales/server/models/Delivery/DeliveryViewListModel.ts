import type { Column } from "drizzle-orm";
import type {
  ListParamsRequest,
  ListParamsResponse,
} from "@base/server/models/interfaces/ListInterface";
import type { ParamFilter } from "@base/server/models/interfaces/FilterInterface";

import { ilike } from "drizzle-orm";
import {
  BaseViewListModel,
  type FilterConditionMap,
} from "@base/server/models/BaseViewListModel";

import { sale_b2c_tb_deliveries } from "../../schemas";

class DeliveryViewListModel extends BaseViewListModel<
  typeof sale_b2c_tb_deliveries,
  any
> {
  constructor() {
    super({
      table: sale_b2c_tb_deliveries,
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
      ["id", { column: sale_b2c_tb_deliveries.id, sort: true }],
      ["orderType", { column: sale_b2c_tb_deliveries.orderType, sort: true }],
      ["orderId", { column: sale_b2c_tb_deliveries.orderId, sort: true }],
      [
        "warehouseId",
        { column: sale_b2c_tb_deliveries.warehouseId, sort: true },
      ],
      [
        "deliveryDate",
        { column: sale_b2c_tb_deliveries.deliveryDate, sort: true },
      ],
      ["reference", { column: sale_b2c_tb_deliveries.reference, sort: true }],
      ["status", { column: sale_b2c_tb_deliveries.status, sort: true }],
      ["createdAt", { column: sale_b2c_tb_deliveries.createdAt, sort: true }],
      ["updatedAt", { column: sale_b2c_tb_deliveries.updatedAt, sort: true }],
    ]);

  protected declarationSearch = () =>
    new Map([
      [
        "reference",
        (text: string) => ilike(sale_b2c_tb_deliveries.reference, text),
      ],
    ]);

  protected declarationFilter = (): FilterConditionMap<ParamFilter> =>
    new Map() as FilterConditionMap<ParamFilter>;

  protected declarationMappingData = (row: any): any => ({
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
  });

  getData = async (
    params: ListParamsRequest,
  ): Promise<ListParamsResponse<any>> => {
    return this.buildQueryDataList(params);
  };
}

export default DeliveryViewListModel;
