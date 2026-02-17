import type {
  ListParamsRequest,
  ListParamsResponse,
} from "@base/shared/interface/ListInterface";
import type { Column } from "drizzle-orm";

import { eq, ilike, sql } from "drizzle-orm";

import {
  BaseViewListModel,
  type FilterConditionMap,
} from "@base/server/models/BaseViewListModel";

import {
  product_tb_product_categories,
  product_tb_product_variants,
  product_tb_units_of_measure,
} from "../../schemas";
import { product_tb_product_masters } from "../../schemas/product.master";

import { ProductFilter, ProductVariantElm } from "./ProductModelInterface";

class ProductViewListModel extends BaseViewListModel<
  typeof product_tb_product_variants,
  // use a view row shape (any) and cast in the public API
  any,
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
      ["id", { column: product_tb_product_variants.id, sort: true }],
      ["name", { column: product_tb_product_variants.name, sort: true }],
      [
        "description",
        { column: product_tb_product_variants.description, sort: true },
      ],
      ["sku", { column: product_tb_product_variants.sku, sort: true }],
      ["barcode", { column: product_tb_product_variants.barcode, sort: true }],
      [
        "manufacturer",
        { column: product_tb_product_variants.manufacturer, sort: true },
      ],
      ["images", { column: product_tb_product_variants.images, sort: true }],
      [
        "isActive",
        { column: product_tb_product_variants.isActive, sort: true },
      ],
      [
        "productMasterId",
        { column: product_tb_product_variants.productMasterId, sort: true },
      ],
      [
        "productMasterName",
        { column: product_tb_product_masters.name, sort: true },
      ],
      [
        "productMasterType",
        { column: product_tb_product_masters.type, sort: true },
      ],
      [
        "productMasterBrand",
        { column: product_tb_product_masters.brand, sort: true },
      ],
      [
        "productMasterFeatures",
        { column: product_tb_product_masters.features, sort: true },
      ],
      ["categoryId", { column: product_tb_product_categories.id, sort: true }],
      [
        "categoryName",
        { column: product_tb_product_categories.name, sort: true },
      ],
      [
        "categoryCode",
        { column: product_tb_product_categories.code, sort: true },
      ],
      [
        "baseUomId",
        { column: product_tb_product_variants.baseUomId, sort: true },
      ],
      ["baseUomName", { column: product_tb_units_of_measure.name, sort: true }],
      [
        "createdAt",
        { column: product_tb_product_variants.createdAt, sort: true },
      ],
      [
        "updatedAt",
        { column: product_tb_product_variants.updatedAt, sort: true },
      ],
    ]);

  protected declarationSearch = () =>
    new Map([
      ["sku", (text: string) => ilike(product_tb_product_variants.sku, text)],
      [
        "barcode",
        (text: string) => ilike(product_tb_product_variants.barcode, text),
      ],
      [
        "manufacturer",
        (text: string) => ilike(product_tb_product_variants.manufacturer, text),
      ],
      ["name", (text: string) => ilike(product_tb_product_variants.name, text)],
      [
        "productMasterCode",
        (text: string) => ilike(product_tb_product_masters.code, text),
      ],
      [
        "productMasterName",
        (text: string) =>
          ilike(sql`${product_tb_product_masters.name}::text`, text),
      ],
      [
        "categoryCode",
        (text: string) => ilike(product_tb_product_categories.code, text),
      ],
      [
        "categoryName",
        (text: string) => ilike(product_tb_product_categories.name, text),
      ],
    ]);

  protected declarationFilter = (): FilterConditionMap<ProductFilter> =>
    new Map([
      [
        "status",
        (value?: unknown, _filters?: ProductFilter) =>
          typeof value === "boolean"
            ? eq(this.table.isActive, value)
            : undefined,
      ],
      [
        "productMasterStatus",
        (value?: unknown, _filters?: ProductFilter) =>
          typeof value === "boolean"
            ? eq(product_tb_product_masters.isActive, value)
            : undefined,
      ],
      [
        "productCategoryStatus",
        (value?: unknown, _filters?: ProductFilter) =>
          typeof value === "boolean"
            ? eq(product_tb_product_categories.isActive, value)
            : undefined,
      ],
      [
        "baseUomStatus",
        (value?: unknown, _filters?: ProductFilter) =>
          typeof value === "boolean"
            ? eq(product_tb_units_of_measure.isActive, value)
            : undefined,
      ],
    ]);

  // Map raw DB row + joined columns -> view row

  protected declarationMappingData = (row: any): ProductVariantElm => {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      sku: row.sku,
      barcode: row.barcode,
      manufacturer: row.manufacturer,
      images: row.images,
      isActive: row.isActive,
      productMaster: {
        id: row.productMasterId,
        name: row.productMasterName,
        type: row.productMasterType,
        brand: row.productMasterBrand,
        features: row.productMasterFeatures,
        category: {
          id: row.categoryId,
          name: row.categoryName,
          code: row.categoryCode,
        },
      },
      baseUom: {
        id: row.baseUomId,
        name: row.baseUomName,
      },
      createdAt: row.createdAt?.getTime(),
      updatedAt: row.updatedAt?.getTime(),
    } as unknown as ProductVariantElm;
  };

  getData = async (
    params: ListParamsRequest<ProductFilter>,
  ): Promise<ListParamsResponse<ProductVariantElm>> => {
    // delegate to shared dataList (which already applies mapping)
    const result = await this.buildQueryDataList(params, (query) => {
      return query
        .innerJoin(
          product_tb_product_masters,
          eq(this.table.productMasterId, product_tb_product_masters.id),
        )
        .leftJoin(
          product_tb_product_categories,
          eq(
            product_tb_product_masters.categoryId,
            product_tb_product_categories.id,
          ),
        )
        .leftJoin(
          product_tb_units_of_measure,
          eq(this.table.baseUomId, product_tb_units_of_measure.id),
        );
    });

    return result as ListParamsResponse<ProductVariantElm>;
  };
}

export default ProductViewListModel;
