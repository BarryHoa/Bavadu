import { BaseViewListModel } from "@base/server/models/BaseViewListModel";
import type {
  ListParamsRequest,
  ListParamsResponse,
} from "@base/server/models/interfaces/ListInterface";
import type { Column } from "drizzle-orm";
import { eq, ilike, sql } from "drizzle-orm";
import { table_price_lists_b2c } from "../../schemas/price-list-b2c";

type PriceListB2CDropdownOption = {
  label: string;
  value: string;
  code: string;
  name: any;
  [key: string]: any;
};

class PriceListB2CDropdownViewListModel extends BaseViewListModel<
  typeof table_price_lists_b2c,
  PriceListB2CDropdownOption
> {
  constructor() {
    super({
      table: table_price_lists_b2c,
      sortDefault: [
        {
          column: "createdAt",
          direction: "descending",
        },
      ],
    });
  }

  protected declarationColumns() {
    // Minimal columns for dropdown
    return new Map<
      string,
      {
        column: Column<any>;
        sort?: boolean;
      }
    >([
      ["id", { column: table_price_lists_b2c.id, sort: false }],
      ["code", { column: table_price_lists_b2c.code, sort: true }],
      ["name", { column: table_price_lists_b2c.name, sort: false }],
    ]);
  }

  protected declarationSearch() {
    return new Map([
      [
        "code",
        (text: string) =>
          text ? ilike(table_price_lists_b2c.code, `%${text}%`) : undefined,
      ],
      [
        "name",
        (text: string) =>
          text
            ? sql`${table_price_lists_b2c.name}::text ILIKE ${`%${text}%`}`
            : undefined,
      ],
    ]);
  }

  protected declarationFilter() {
    return new Map();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected declarationMappingData(row: any): PriceListB2CDropdownOption {
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
  ): Promise<ListParamsResponse<PriceListB2CDropdownOption>> => {
    // Use buildQueryDataListWithSelect to select only needed columns
    const result = await this.buildQueryDataListWithSelect(
      params,
      {
        id: table_price_lists_b2c.id,
        code: table_price_lists_b2c.code,
        name: table_price_lists_b2c.name,
      },
      (query) => {
        // Filter only active price lists
        return query.where(eq(table_price_lists_b2c.status, "active"));
      }
    );

    return {
      data: result.data,
      total: result.total,
    };
  };
}

export default PriceListB2CDropdownViewListModel;
