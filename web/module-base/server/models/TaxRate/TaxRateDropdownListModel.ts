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

import { base_tb_tax_rates } from "../../schemas/base.tax-rate";
import { ParamFilter } from "@base/shared/interface/FilterInterface";

type TaxRateDropdownOption = {
  label: string;
  value: string;
  code: string;
  name: any;
  [key: string]: any;
};

class TaxRateDropdownListModel extends BaseViewListModel<
  typeof base_tb_tax_rates,
  TaxRateDropdownOption
> {
  constructor() {
    super({
      table: base_tb_tax_rates,
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
      ["id", { column: base_tb_tax_rates.id, sort: false }],
      ["code", { column: base_tb_tax_rates.code, sort: true }],
      ["name", { column: base_tb_tax_rates.name, sort: false }],
      ["order", { column: base_tb_tax_rates.order, sort: true }],
    ]);

  protected declarationSearch = () => new Map();

  protected declarationFilter = (): FilterConditionMap<ParamFilter> =>
    new Map([
      [
        "isActive",
        (value?: unknown, _filters?: ParamFilter) =>
          typeof value === "boolean"
            ? eq(base_tb_tax_rates.isActive, value)
            : undefined,
      ],
      [
        "type",
        (value?: unknown, _filters?: ParamFilter) =>
          Array.isArray(value) && value.length > 0
            ? inArray(base_tb_tax_rates.type, value as string[])
            : undefined,
      ],
    ]);

  protected declarationMappingData = (
    row: any,
    index?: number,
  ): TaxRateDropdownOption => {
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
  ): Promise<ListParamsResponse<TaxRateDropdownOption>> => {
    const result = await this.buildQueryDataListWithSelect(
      params,
      {
        id: base_tb_tax_rates.id,
        code: base_tb_tax_rates.code,
        name: base_tb_tax_rates.name,
        order: base_tb_tax_rates.order,
      },
      (query) => {
        return query.orderBy(asc(base_tb_tax_rates.order)).limit(params.limit);
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

export default TaxRateDropdownListModel;
