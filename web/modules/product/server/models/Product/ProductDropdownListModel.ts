import { BaseViewListModel } from "@base/server/models/BaseViewListModel";
import { ParamFilter } from "@base/server/models/interfaces/FilterInterface";
import type {
  ListParamsRequest,
  ListParamsResponse,
} from "@base/server/models/interfaces/ListInterface";
import type { Column } from "drizzle-orm";
import { eq, or, sql } from "drizzle-orm";
import { isArray } from "lodash";
import { table_product_master, table_product_variant } from "../../schemas";
import { ProductMasterFeaturesEnum } from "../interfaces/ProductMaster";
import { ProductFilter } from "./ProductModelInterface";

type ProductDropdownOption = {
  label: string;
  value: string;
  [key: string]: any;
};

class ProductDropdownListModel extends BaseViewListModel<
  typeof table_product_variant,
  ProductDropdownOption,
  ProductFilter
> {
  constructor() {
    super({
      table: table_product_variant,
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
      ["id", { column: table_product_variant.id, sort: false }],
      ["name", { column: table_product_variant.name, sort: false }],
      ["sku", { column: table_product_variant.sku, sort: false }],
      ["barcode", { column: table_product_variant.barcode, sort: false }],
      [
        "manufacturer",
        { column: table_product_variant.manufacturer, sort: false },
      ],
      ["baseUomId", { column: table_product_variant.baseUomId, sort: false }],
    ]);
  }

  protected declarationSearch() {
    return new Map();
  }

  protected declarationFilter() {
    return new Map([
      [
        "isActive",
        (value: any) =>
          value
            ? eq(table_product_variant.isActive, value as boolean)
            : undefined,
      ],
      [
        "features",
        (value: any, filters: ProductFilter) => {
          return value && isArray(value)
            ? or(
                ...(value as ProductMasterFeaturesEnum[]).map(
                  (feature) =>
                    sql`${table_product_master.features} ->> ${feature} = 'true'`
                )
              )
            : undefined;
        },
      ] as any,
    ]) as Map<string, (value?: unknown, filters?: ParamFilter) => unknown>;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected declarationMappingData(
    row: any,
    index?: number
  ): ProductDropdownOption {
    const name =
      typeof row.name === "string"
        ? row.name
        : row.name?.vi || row.name?.en || "";

    return {
      label: name,
      value: row.id,
    };
  }

  getData = async (
    params: ListParamsRequest<ProductFilter>
  ): Promise<ListParamsResponse<ProductDropdownOption>> => {
    const result = await this.buildQueryDataList(params, (query) => {
      return query.innerJoin(
        table_product_master,
        eq(table_product_variant.productMasterId, table_product_master.id)
      );
    });
    return {
      data: (result?.data ?? []).map((row: any, index: number) =>
        this.declarationMappingData(row, index)
      ),
      total: result?.total ?? 0,
    };
  };
}

export default ProductDropdownListModel;
