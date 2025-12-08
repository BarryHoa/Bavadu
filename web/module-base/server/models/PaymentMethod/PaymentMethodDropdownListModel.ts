import { BaseViewListModel } from "@base/server/models/BaseViewListModel";
import type {
  ListParamsRequest,
  ListParamsResponse,
} from "@base/server/models/interfaces/ListInterface";
import type { Column } from "drizzle-orm";
import { asc, eq, inArray } from "drizzle-orm";
import { table_payment_method } from "../../schemas/payment-method";
import { ParamFilter } from "../interfaces/FilterInterface";

type PaymentMethodDropdownOption = {
  label: string;
  value: string;
  code: string;
  name: any;
  [key: string]: any;
};

class PaymentMethodDropdownListModel extends BaseViewListModel<
  typeof table_payment_method,
  PaymentMethodDropdownOption
> {
  constructor() {
    super({
      table: table_payment_method,
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
      ["id", { column: table_payment_method.id, sort: false }],
      ["code", { column: table_payment_method.code, sort: true }],
      ["name", { column: table_payment_method.name, sort: false }],
      ["order", { column: table_payment_method.order, sort: true }],
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
            ? eq(table_payment_method.isActive, value as boolean)
            : undefined,
      ],
      [
        "type",
        (value) =>
          value && Array.isArray(value)
            ? inArray(table_payment_method.type, value as string[])
            : undefined,
      ],
    ]) as Map<string, (value?: unknown, filters?: ParamFilter) => unknown>;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected declarationMappingData(
    row: any,
    index?: number
  ): PaymentMethodDropdownOption {
    // Handle LocaleDataType<string> for name
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
  ): Promise<ListParamsResponse<PaymentMethodDropdownOption>> => {
    const result = await this.buildQueryDataListWithSelect(
      params,
      {
        id: table_payment_method.id,
        code: table_payment_method.code,
        name: table_payment_method.name,
        order: table_payment_method.order,
      },
      (query) => {
        return query
          .orderBy(asc(table_payment_method.order))
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

export default PaymentMethodDropdownListModel;
