import type { Column } from "drizzle-orm";
import type {
  ListParamsRequest,
  ListParamsResponse,
} from "@base/server/models/interfaces/ListInterface";
import type { ParamFilter } from "@base/server/models/interfaces/FilterInterface";

import { ilike, sql } from "drizzle-orm";
import {
  BaseViewListModel,
  type FilterConditionMap,
} from "@base/server/models/BaseViewListModel";

import { sale_b2c_tb_price_lists } from "../../schemas/b2c-sales.price-list";

class PriceListB2CViewListModel extends BaseViewListModel<
  typeof sale_b2c_tb_price_lists,
  any
> {
  constructor() {
    super({
      table: sale_b2c_tb_price_lists,
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
      ["id", { column: sale_b2c_tb_price_lists.id, sort: false }],
      ["code", { column: sale_b2c_tb_price_lists.code, sort: true }],
      ["name", { column: sale_b2c_tb_price_lists.name, sort: false }],
      ["type", { column: sale_b2c_tb_price_lists.type, sort: true }],
      ["status", { column: sale_b2c_tb_price_lists.status, sort: true }],
      ["priority", { column: sale_b2c_tb_price_lists.priority, sort: true }],
      ["isDefault", { column: sale_b2c_tb_price_lists.isDefault, sort: true }],
      ["validFrom", { column: sale_b2c_tb_price_lists.validFrom, sort: true }],
      ["validTo", { column: sale_b2c_tb_price_lists.validTo, sort: true }],
      ["createdAt", { column: sale_b2c_tb_price_lists.createdAt, sort: true }],
      ["updatedAt", { column: sale_b2c_tb_price_lists.updatedAt, sort: true }],
    ]);

  protected declarationSearch = () =>
    new Map([
      [
        "code",
        (text: string) =>
          text ? ilike(sale_b2c_tb_price_lists.code, `%${text}%`) : undefined,
      ],
      [
        "name",
        (text: string) =>
          text
            ? sql`${sale_b2c_tb_price_lists.name}::text ILIKE ${`%${text}%`}`
            : undefined,
      ],
    ]);

  protected declarationFilter = (): FilterConditionMap<ParamFilter> =>
    new Map() as FilterConditionMap<ParamFilter>;

  protected declarationMappingData = (row: any): any => ({
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description,
    type: row.type,
    status: row.status,
    priority: row.priority,
    currencyId: row.currencyId ?? undefined,
    validFrom: row.validFrom?.getTime(),
    validTo: row.validTo?.getTime(),
    isDefault: row.isDefault,
    applicableTo: row.applicableTo,
    createdAt: row.createdAt?.getTime(),
    updatedAt: row.updatedAt?.getTime(),
  });

  getData = async (
    params: ListParamsRequest,
  ): Promise<ListParamsResponse<any>> => {
    return this.buildQueryDataList(params);
  };
}

export default PriceListB2CViewListModel;
