import type { ParamFilter } from "@base/server/models/interfaces/FilterInterface";
import type {
  ListParamsRequest,
  ListParamsResponse,
} from "@base/server/models/interfaces/ListInterface";
import type { Column } from "drizzle-orm";

import {
  BaseViewListModel,
  type FilterConditionMap,
} from "@base/server/models/BaseViewListModel";
import { eq, ilike, sql } from "drizzle-orm";

import { sale_b2c_tb_price_lists } from "../../schemas/b2c-sales.price-list";

type PriceListB2CDropdownOption = {
  label: string;
  value: string;
  code: string;
  name: any;
  [key: string]: any;
};

class PriceListB2CDropdownListModel extends BaseViewListModel<
  typeof sale_b2c_tb_price_lists,
  PriceListB2CDropdownOption
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
    // Minimal columns for dropdown
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

  protected declarationMappingData = (
    row: any,
    index?: number,
  ): PriceListB2CDropdownOption => {
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
  ): Promise<ListParamsResponse<PriceListB2CDropdownOption>> => {
    // Use buildQueryDataListWithSelect to select only needed columns
    const result = await this.buildQueryDataListWithSelect(
      params,
      {
        id: sale_b2c_tb_price_lists.id,
        code: sale_b2c_tb_price_lists.code,
        name: sale_b2c_tb_price_lists.name,
      },
      (query) => {
        // Filter only active price lists
        return query.where(eq(sale_b2c_tb_price_lists.status, "active"));
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

export default PriceListB2CDropdownListModel;
