import type {
  ListParamsRequest,
  ListParamsResponse,
} from "@base/shared/interface/ListInterface";
import type { Column } from "drizzle-orm";

import { asc, eq, inArray } from "drizzle-orm";

import {
  BaseViewListModel,
  type FilterConditionMap,
} from "@base/server/models/BaseViewListModel";
import { ParamFilter } from "@base/shared/interface/FilterInterface";

import { base_tb_payment_methods } from "../../schemas/base.payment-method";

type PaymentMethodDropdownOption = {
  label: string;
  value: string;
  code: string;
  name: any;
  [key: string]: any;
};

class PaymentMethodDropdownListModel extends BaseViewListModel<
  typeof base_tb_payment_methods,
  PaymentMethodDropdownOption
> {
  constructor() {
    super({
      table: base_tb_payment_methods,
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
      ["id", { column: base_tb_payment_methods.id, sort: false }],
      ["code", { column: base_tb_payment_methods.code, sort: true }],
      ["name", { column: base_tb_payment_methods.name, sort: false }],
      ["order", { column: base_tb_payment_methods.order, sort: true }],
    ]);

  protected declarationSearch = () => new Map();

  protected declarationFilter = (): FilterConditionMap<ParamFilter> =>
    new Map([
      [
        "isActive",
        (value?: unknown, _filters?: ParamFilter) =>
          typeof value === "boolean"
            ? eq(base_tb_payment_methods.isActive, value)
            : undefined,
      ],
      [
        "type",
        (value?: unknown, _filters?: ParamFilter) =>
          Array.isArray(value) && value.length > 0
            ? inArray(base_tb_payment_methods.type, value as string[])
            : undefined,
      ],
    ]);

  protected declarationMappingData = (
    row: any,
    index?: number,
  ): PaymentMethodDropdownOption => {
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
  };

  getData = async (
    params: ListParamsRequest,
  ): Promise<ListParamsResponse<PaymentMethodDropdownOption>> => {
    const result = await this.buildQueryDataListWithSelect(
      params,
      {
        id: base_tb_payment_methods.id,
        code: base_tb_payment_methods.code,
        name: base_tb_payment_methods.name,
        order: base_tb_payment_methods.order,
      },
      (query) => {
        return query
          .orderBy(asc(base_tb_payment_methods.order))
          .limit(params.limit);
      },
    );

    return {
      data: result.data.map((row: any, index: number) =>
        this.declarationMappingData(row, index),
      ),
      total: result.total,
    };
  };
}

export default PaymentMethodDropdownListModel;
