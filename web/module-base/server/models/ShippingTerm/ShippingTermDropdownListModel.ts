import {
  BaseViewListModel,
  type FilterConditionMap,
} from "@base/server/models/BaseViewListModel";
import type {
  ListParamsRequest,
  ListParamsResponse,
} from "@base/server/models/interfaces/ListInterface";
import type { Column } from "drizzle-orm";
import { asc, eq, inArray } from "drizzle-orm";
import { base_tb_shipping_terms } from "../../schemas/base.shipping-term";
import { ParamFilter } from "../interfaces/FilterInterface";

type ShippingTermDropdownOption = {
  label: string;
  value: string;
  code: string;
  name: any;
  [key: string]: any;
};

class ShippingTermDropdownListModel extends BaseViewListModel<
  typeof base_tb_shipping_terms,
  ShippingTermDropdownOption
> {
  constructor() {
    super({
      table: base_tb_shipping_terms,
      sortDefault: [
        {
          column: "order",
          direction: "ascending",
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
      ["id", { column: base_tb_shipping_terms.id, sort: false }],
      ["code", { column: base_tb_shipping_terms.code, sort: true }],
      ["name", { column: base_tb_shipping_terms.name, sort: false }],
      ["order", { column: base_tb_shipping_terms.order, sort: true }],
    ]);

  protected declarationSearch = () => new Map();

  protected declarationFilter = (): FilterConditionMap<ParamFilter> =>
    new Map([
      [
        "isActive",
        (value?: unknown, _filters?: ParamFilter) =>
          typeof value === "boolean"
            ? eq(base_tb_shipping_terms.isActive, value)
            : undefined,
      ],
      [
        "type",
        (value?: unknown, _filters?: ParamFilter) =>
          Array.isArray(value) && value.length > 0
            ? inArray(base_tb_shipping_terms.type, value as string[])
            : undefined,
      ],
    ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected declarationMappingData = (
    row: any,
    index?: number
  ): ShippingTermDropdownOption => {
    const name =
      typeof row.name === "string"
        ? row.name
        : row.name?.vi || row.name?.en || row.code || "";

    return {
      label: `${row.code} - ${name}`,
      value: row.id,
      code: row.code,
      name: row.name,
    };
  }

  getData = async (
    params: ListParamsRequest
  ): Promise<ListParamsResponse<ShippingTermDropdownOption>> => {
    const result = await this.buildQueryDataListWithSelect(
      params,
      {
        id: base_tb_shipping_terms.id,
        code: base_tb_shipping_terms.code,
        name: base_tb_shipping_terms.name,
        order: base_tb_shipping_terms.order,
      },
      (query) => {
        return query
          .orderBy(asc(base_tb_shipping_terms.order))
          .limit(params.limit);
      }
    );

    return {
      data: result.data.map((row: any, index: number) =>
        this.declarationMappingData(row, index)
      ),
      total: result.total,
    };
  };
}

export default ShippingTermDropdownListModel;
