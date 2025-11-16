import { BaseViewListModel } from "@base/server/models/BaseViewListModel";
import type {
  ListParamsRequest,
  ListParamsResponse,
} from "@base/server/models/interfaces/ListInterface";
import type { Column } from "drizzle-orm";
import { ilike, sql } from "drizzle-orm";
import {
  table_product_category,
  table_product_variant,
  table_unit_of_measure,
} from "../../schemas";
import { table_product_master } from "../../schemas/product-master";

import { ProductFilter, ProductVariantElm } from "./ProductModelInterface";

class ListProductModel extends BaseViewListModel<
  typeof table_product_variant,
  // use a view row shape (any) and cast in the public API
  any,
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
      ["id", { column: table_product_variant.id, sort: true }],
      ["name", { column: table_product_variant.name, sort: true }],
      [
        "description",
        { column: table_product_variant.description, sort: true },
      ],
      ["sku", { column: table_product_variant.sku, sort: true }],
      ["barcode", { column: table_product_variant.barcode, sort: true }],
      [
        "manufacturer",
        { column: table_product_variant.manufacturer, sort: true },
      ],
      ["images", { column: table_product_variant.images, sort: true }],
      ["isActive", { column: table_product_variant.isActive, sort: true }],
      [
        "productMasterId",
        { column: table_product_variant.productMasterId, sort: true },
      ],
      ["productMasterName", { column: table_product_master.name, sort: true }],
      ["productMasterType", { column: table_product_master.type, sort: true }],
      [
        "productMasterBrand",
        { column: table_product_master.brand, sort: true },
      ],
      [
        "productMasterFeatures",
        { column: table_product_master.features, sort: true },
      ],
      ["categoryId", { column: table_product_category.id, sort: true }],
      ["categoryName", { column: table_product_category.name, sort: true }],
      ["categoryCode", { column: table_product_category.code, sort: true }],
      ["baseUomId", { column: table_product_variant.baseUomId, sort: true }],
      ["baseUomName", { column: table_unit_of_measure.name, sort: true }],
      ["createdAt", { column: table_product_variant.createdAt, sort: true }],
      ["updatedAt", { column: table_product_variant.updatedAt, sort: true }],
    ]);
  }

  protected declarationSearch() {
    return [
      (text: string) => ilike(table_product_variant.sku, text),
      (text: string) => ilike(table_product_variant.barcode, text),
      (text: string) => ilike(table_product_variant.manufacturer, text),
      (text: string) => ilike(table_product_variant.name, text),
      (text: string) => ilike(table_product_master.code, text),
      (text: string) => ilike(sql`${table_product_master.name}::text`, text),
      (text: string) => ilike(table_product_category.code, text),
      (text: string) => ilike(table_product_category.name, text),
    ];
  }

  protected declarationFilter() {
    return [];
  }

  // Map raw DB row + joined columns -> view row
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected declarationMappingData(row: any): ProductVariantElm {
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
  }

  getData = async (
    params: ListParamsRequest<ProductFilter>
  ): Promise<ListParamsResponse<ProductVariantElm>> => {
    // delegate to shared dataList (which already applies mapping)
    const result = await this.buildQueryDataList(params);
    return result as ListParamsResponse<ProductVariantElm>;
  };
}

export default ListProductModel;
