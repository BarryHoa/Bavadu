import { BaseViewListModel } from "@base/server/models/BaseViewListModel";
import type {
  ListParamsRequest,
  ListParamsResponse,
} from "@base/server/models/interfaces/ListInterface";
import type { Column } from "drizzle-orm";
import { asc, eq, inArray } from "drizzle-orm";
import { table_shipping_term } from "../../schemas/shipping-term";
import { ParamFilter } from "../interfaces/FilterInterface";

type ShippingTermDropdownOption = {
  label: string;
  value: string;
  code: string;
  name: any;
  [key: string]: any;
};

class ShippingTermDropdownListModel extends BaseViewListModel<
  typeof table_shipping_term,
  ShippingTermDropdownOption
> {
  constructor() {
    super({
      table: table_shipping_term,
      sortDefault: [
        {
          column: "order",
          direction: "ascending",
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
      ["id", { column: table_shipping_term.id, sort: false }],
      ["code", { column: table_shipping_term.code, sort: true }],
      ["name", { column: table_shipping_term.name, sort: false }],
      ["order", { column: table_shipping_term.order, sort: true }],
    ]);
  }

  protected declarationSearch() {
    return new Map();
  }

  protected declarationFilter() {
    return new Map([
      [
        "isActive",
        (value) =>
          value
            ? eq(table_shipping_term.isActive, value as boolean)
            : undefined,
      ],
      [
        "type",
        (value) =>
          value && Array.isArray(value)
            ? inArray(table_shipping_term.type, value as string[])
            : undefined,
      ],
    ]) as Map<string, (value?: unknown, filters?: ParamFilter) => unknown>;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected declarationMappingData(
    row: any,
    index?: number
  ): ShippingTermDropdownOption {
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
        id: table_shipping_term.id,
        code: table_shipping_term.code,
        name: table_shipping_term.name,
        order: table_shipping_term.order,
      },
      (query) => {
        return query
          .orderBy(asc(table_shipping_term.order))
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
