import type { Column } from "drizzle-orm";
import { eq, ilike, sql } from "drizzle-orm";

import { BaseViewListModel } from "@base/server/models/BaseViewListModel";
import type {
  ListParamsRequest,
  ListParamsResponse,
} from "@base/server/models/interfaces/ListInterface";
import { table_price_lists_b2c } from "../../schemas/price-list-b2c";

class ListPriceListB2CModel extends BaseViewListModel<
  typeof table_price_lists_b2c,
  any
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
      ["type", { column: table_price_lists_b2c.type, sort: true }],
      ["status", { column: table_price_lists_b2c.status, sort: true }],
      ["priority", { column: table_price_lists_b2c.priority, sort: true }],
      ["isDefault", { column: table_price_lists_b2c.isDefault, sort: true }],
      ["validFrom", { column: table_price_lists_b2c.validFrom, sort: true }],
      ["validTo", { column: table_price_lists_b2c.validTo, sort: true }],
      ["createdAt", { column: table_price_lists_b2c.createdAt, sort: true }],
      ["updatedAt", { column: table_price_lists_b2c.updatedAt, sort: true }],
    ]);
  }

  protected declarationSearch() {
    return [
      (text: string) =>
        text ? ilike(table_price_lists_b2c.code, `%${text}%`) : undefined,
      (text: string) =>
        text
          ? sql`${table_price_lists_b2c.name}::text ILIKE ${`%${text}%`}`
          : undefined,
    ];
  }

  protected declarationFilter() {
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected declarationMappingData(row: any): any {
    return {
      id: row.id,
      code: row.code,
      name: row.name,
      description: row.description,
      type: row.type,
      status: row.status,
      priority: row.priority,
      currencyId: row.currencyId ?? undefined,
      validFrom: row.validFrom?.getTime(),
      validTo: row.validTo?.getTime(),
      isDefault: row.isDefault,
      applicableTo: row.applicableTo,
      createdAt: row.createdAt?.getTime(),
      updatedAt: row.updatedAt?.getTime(),
    };
  }

  getData = async (
    params: ListParamsRequest
  ): Promise<ListParamsResponse<any>> => {
    return this.buildQueryDataList(params);
  };

  getOptionsDropdown = async (
    params: ListParamsRequest
  ): Promise<
    ListParamsResponse<{
      label: string;
      value: string;
      [key: string]: any;
    }>
  > => {
    // Use buildQueryDataListWithSelect to select only needed columns
    const result = await this.buildQueryDataListWithSelect(
      params,
      (qb) =>
        qb.select({
          id: table_price_lists_b2c.id,
          code: table_price_lists_b2c.code,
          name: table_price_lists_b2c.name,
        }),
      (query) => {
        // Filter only active price lists
        return query.where(eq(table_price_lists_b2c.status, "active"));
      }
    );

    return {
      data: result.data.map((item: any) => {
        // Handle LocaleDataType<string> for name
        const name =
          typeof item.name === "string"
            ? item.name
            : item.name?.vi || item.name?.en || item.code || "";

        return {
          label: `${item.code} - ${name}`,
          value: item.id,
          code: item.code,
          name: item.name,
        };
      }),
      total: result.total,
    };
  };
}

export default ListPriceListB2CModel;
