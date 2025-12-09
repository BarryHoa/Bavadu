import {
  BaseViewListModel,
  type FilterCondition,
  type FilterConditionMap,
} from "@base/server/models/BaseViewListModel";
import type {
  ListParamsRequest,
  ListParamsResponse,
} from "@base/server/models/interfaces/ListInterface";
import type { Column } from "drizzle-orm";
import { eq, ilike, or, sql } from "drizzle-orm";
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

  protected declarationColumns = () =>
    new Map<
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
      ["baseUomId", { column: table_product_variant.baseUomId, sort: false }],
      ["features", { column: table_product_master.features, sort: false }],
    ]);

  protected declarationSearch = () =>
    new Map([
      // name is jsonb, need to cast to text before using ilike
      [
        "name",
        (text: string) =>
          ilike(sql`${table_product_variant.name}::text`, `%${text}%`),
      ],
      ["sku", (text: string) => ilike(table_product_variant.sku, `%${text}%`)],
      [
        "barcode",
        (text: string) => ilike(table_product_variant.barcode, `%${text}%`),
      ],
    ]);

  protected declarationFilter = (): FilterConditionMap<ProductFilter> => {
    const filters: Array<[string, FilterCondition<ProductFilter>]> = [
      [
        "isActive",
        (value?: unknown) =>
          typeof value === "boolean"
            ? eq(table_product_variant.isActive, value)
            : undefined,
      ],
      [
        "features",
        (value?: unknown) => {
          const featureList = Array.isArray(value)
            ? (value as ProductMasterFeaturesEnum[])
            : undefined;
          return featureList && featureList.length > 0
            ? or(
                ...featureList.map(
                  (feature) =>
                    sql`${table_product_master.features} ->> '${feature}' = 'true'`
                )
              )
            : undefined;
        },
      ],
    ];

    return new Map(filters);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected declarationMappingData = (row: any): ProductDropdownOption => {
    return {
      label: row.name,
      value: row.id,
      ...row,
    };
  };

  getData = async (
    params: ListParamsRequest<ProductFilter>
  ): Promise<ListParamsResponse<ProductDropdownOption>> => {
    return this.buildQueryDataList(params, (query) => {
      return query.innerJoin(
        table_product_master,
        eq(table_product_variant.productMasterId, table_product_master.id)
      );
    });
  };
}

export default ProductDropdownListModel;
