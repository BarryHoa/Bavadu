import { BaseViewListModel } from "@base/server/models/BaseViewListModel";
import type {
  ListParamsRequest,
  ListParamsResponse,
} from "@base/server/models/interfaces/ListInterface";
import type { Column } from "drizzle-orm";
import { asc, eq } from "drizzle-orm";
import { table_tax_rate } from "../../schemas/tax-rate";

type TaxRateDropdownOption = {
  label: string;
  value: string;
  code: string;
  name: any;
  [key: string]: any;
};

class TaxRateDropdownViewListModel extends BaseViewListModel<
  typeof table_tax_rate,
  TaxRateDropdownOption
> {
  constructor() {
    super({
      table: table_tax_rate,
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
      ["id", { column: table_tax_rate.id, sort: false }],
      ["code", { column: table_tax_rate.code, sort: true }],
      ["name", { column: table_tax_rate.name, sort: false }],
      ["order", { column: table_tax_rate.order, sort: true }],
    ]);
  }

  protected declarationSearch() {
    return new Map();
  }

  protected declarationFilter() {
    return new Map([
      ["isActive", (value: boolean | undefined) => {
        return eq(table_tax_rate.isActive, true);
      }],
    ]);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected declarationMappingData(row: any): TaxRateDropdownOption {
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
  ): Promise<ListParamsResponse<TaxRateDropdownOption>> => {
    const result = await this.buildQueryDataListWithSelect(
      params,
      {
        id: table_tax_rate.id,
        code: table_tax_rate.code,
        name: table_tax_rate.name,
        order: table_tax_rate.order,
      },
      (query) => {
        return query
          .where(eq(table_tax_rate.isActive, true))
          .orderBy(asc(table_tax_rate.order));
      }
    );

    return {
      data: result.data,
      total: result.total,
    };
  };
}

export default TaxRateDropdownViewListModel;

