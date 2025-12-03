import { BaseViewListModel } from "@base/server/models/BaseViewListModel";
import type {
  ListParamsRequest,
  ListParamsResponse,
} from "@base/server/models/interfaces/ListInterface";
import type { Column } from "drizzle-orm";
import { asc, eq } from "drizzle-orm";
import { table_shipping_method } from "../../schemas/shipping-method";

type ShippingMethodDropdownOption = {
  label: string;
  value: string;
  code: string;
  name: any;
  [key: string]: any;
};

class ShippingMethodDropdownListModel extends BaseViewListModel<
  typeof table_shipping_method,
  ShippingMethodDropdownOption
> {
  constructor() {
    super({
      table: table_shipping_method,
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
      ["id", { column: table_shipping_method.id, sort: false }],
      ["code", { column: table_shipping_method.code, sort: true }],
      ["name", { column: table_shipping_method.name, sort: false }],
      ["order", { column: table_shipping_method.order, sort: true }],
    ]);
  }

  protected declarationSearch() {
    return new Map();
  }

  protected declarationFilter() {
    return new Map([
      [
        "isActive",
        (value: boolean | undefined) => {
          return eq(table_shipping_method.isActive, true);
        },
      ],
    ]);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected declarationMappingData(
    row: any,
    index: number
  ): ShippingMethodDropdownOption {
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
  ): Promise<ListParamsResponse<ShippingMethodDropdownOption>> => {
    const result = await this.buildQueryDataListWithSelect(
      params,
      {
        id: table_shipping_method.id,
        code: table_shipping_method.code,
        name: table_shipping_method.name,
        order: table_shipping_method.order,
      },
      (query) => {
        return query
          .where(eq(table_shipping_method.isActive, true))
          .orderBy(asc(table_shipping_method.order));
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

export default ShippingMethodDropdownListModel;

