import type {
  ListParamsRequest,
  ListParamsResponse,
} from "@base/shared/interface/ListInterface";
import type { Column } from "drizzle-orm";

import {
  BaseViewListModel,
  type FilterConditionMap,
} from "@base/server/models/BaseViewListModel";
import { asc, eq, inArray } from "drizzle-orm";

import { base_tb_payment_terms } from "../../schemas/base.payment-term";
import { ParamFilter } from "@base/shared/interface/FilterInterface";

type PaymentTermDropdownOption = {
  label: string;
  value: string;
  code: string;
  name: any;
  [key: string]: any;
};

class PaymentTermDropdownListModel extends BaseViewListModel<
  typeof base_tb_payment_terms,
  PaymentTermDropdownOption
> {
  constructor() {
    super({
      table: base_tb_payment_terms,
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
      ["id", { column: base_tb_payment_terms.id, sort: false }],
      ["code", { column: base_tb_payment_terms.code, sort: true }],
      ["name", { column: base_tb_payment_terms.name, sort: false }],
      ["order", { column: base_tb_payment_terms.order, sort: true }],
    ]);

  protected declarationSearch = () => new Map();

  protected declarationFilter = (): FilterConditionMap<ParamFilter> =>
    new Map([
      [
        "isActive",
        (value?: unknown, _filters?: ParamFilter) =>
          typeof value === "boolean"
            ? eq(base_tb_payment_terms.isActive, value)
            : undefined,
      ],
      [
        "type",
        (value?: unknown, _filters?: ParamFilter) =>
          Array.isArray(value) && value.length > 0
            ? inArray(base_tb_payment_terms.type, value as string[])
            : undefined,
      ],
    ]);

  protected declarationMappingData = (
    row: any,
    index?: number,
  ): PaymentTermDropdownOption => {
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
  ): Promise<ListParamsResponse<PaymentTermDropdownOption>> => {
    const result = await this.buildQueryDataListWithSelect(
      params,
      {
        id: base_tb_payment_terms.id,
        code: base_tb_payment_terms.code,
        name: base_tb_payment_terms.name,
        order: base_tb_payment_terms.order,
      },
      (query) => {
        return query
          .orderBy(asc(base_tb_payment_terms.order))
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

export default PaymentTermDropdownListModel;
