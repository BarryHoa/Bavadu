import type {
  ListParamsRequest,
  ListParamsResponse,
} from "@base/shared/interface/ListInterface";
import type { Column } from "drizzle-orm";

import {
  BaseViewListModel,
  type FilterCondition,
  type FilterConditionMap,
} from "@base/server/models/BaseViewListModel";
import { eq, ilike, or, sql } from "drizzle-orm";

import {
  product_tb_product_masters,
  product_tb_product_variants,
} from "../../schemas";
import { ProductMasterFeaturesEnum } from "../interfaces/ProductMaster";

import { ProductFilter } from "./ProductModelInterface";

type ProductDropdownOption = {
  label: string;
  value: string;
  [key: string]: any;
};

class ProductDropdownListModel extends BaseViewListModel<
  typeof product_tb_product_variants,
  ProductDropdownOption,
  ProductFilter
> {
  constructor() {
    super({
      table: product_tb_product_variants,
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
      ["id", { column: product_tb_product_variants.id, sort: false }],
      ["name", { column: product_tb_product_variants.name, sort: false }],
      ["sku", { column: product_tb_product_variants.sku, sort: false }],
      ["barcode", { column: product_tb_product_variants.barcode, sort: false }],
      [
        "baseUomId",
        { column: product_tb_product_variants.baseUomId, sort: false },
      ],
      [
        "features",
        { column: product_tb_product_masters.features, sort: false },
      ],
    ]);

  protected declarationSearch = () =>
    new Map([
      // name is jsonb, need to cast to text before using ilike
      [
        "name",
        (text: string) =>
          ilike(sql`${product_tb_product_variants.name}::text`, `%${text}%`),
      ],
      [
        "sku",
        (text: string) => ilike(product_tb_product_variants.sku, `%${text}%`),
      ],
      [
        "barcode",
        (text: string) =>
          ilike(product_tb_product_variants.barcode, `%${text}%`),
      ],
    ]);

  protected declarationFilter = (): FilterConditionMap<ProductFilter> => {
    const filters: Array<[string, FilterCondition<ProductFilter>]> = [
      [
        "isActive",
        (value?: unknown) =>
          typeof value === "boolean"
            ? eq(product_tb_product_variants.isActive, value)
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
                    sql`${product_tb_product_masters.features} ->> '${feature}' = 'true'`,
                ),
              )
            : undefined;
        },
      ],
    ];

    return new Map(filters);
  };

  protected declarationMappingData = (row: any): ProductDropdownOption => {
    return {
      label: row.name,
      value: row.id,
      ...row,
    };
  };

  getData = async (
    params: ListParamsRequest<ProductFilter>,
  ): Promise<ListParamsResponse<ProductDropdownOption>> => {
    return this.buildQueryDataList(params, (query) => {
      return query.innerJoin(
        product_tb_product_masters,
        eq(
          product_tb_product_variants.productMasterId,
          product_tb_product_masters.id,
        ),
      );
    });
  };
}

export default ProductDropdownListModel;
