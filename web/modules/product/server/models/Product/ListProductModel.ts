import { BaseViewListModel } from "@base/server/models/BaseViewListModel";
import { eq, sql } from "drizzle-orm";

import { getEnv } from "@base/server";
import type {
  ListParamsRequest,
  ListParamsResponse,
} from "@base/server/models/interfaces/ListInterface";
import {
  table_product_category,
  table_product_variant,
  table_unit_of_measure,
} from "../../schemas";
import { table_product_master } from "../../schemas/product-master";

import { ProductFilter, ProductVariantElm } from "./ProductModelInterface";

class ListProductModel extends BaseViewListModel<
  typeof table_product_variant,
  ProductVariantElm,
  ProductFilter
> {
  constructor() {
    super(table_product_variant);
  }

  getViewDataList = async (
    params: ListParamsRequest<ProductFilter>
  ): Promise<ListParamsResponse<ProductVariantElm>> => {
    const env = getEnv();
    const db = env.getDb();

    const { offset, limit, search, filters, sorts } =
      this.getDefaultParamsForList(params);

    // Get data with total count in single query using window function
    const products = await db
      .select({
        // Product variant fields
        id: this.table.id,
        name: this.table.name,
        description: this.table.description,
        sku: this.table.sku,
        barcode: this.table.barcode,
        manufacturer: this.table.manufacturer,
        images: this.table.images,
        isActive: this.table.isActive,
        // Product master fields (flat)
        productMasterId: table_product_master.id,
        productMasterName: table_product_master.name,
        productMasterType: table_product_master.type,
        productMasterBrand: table_product_master.brand,
        productMasterFeatures: table_product_master.features,

        // Category fields (flat)
        categoryId: table_product_category.id,
        categoryName: table_product_category.name,
        categoryCode: table_product_category.code,
        baseUomId: this.table.baseUomId,
        baseUomName: table_unit_of_measure.name,

        createdAt: this.table.createdAt,
        updatedAt: this.table.updatedAt,
        // Total count using window function (same for all rows)
        total: sql<number>`count(*) over()::int`.as("total"),
      })
      .from(this.table)
      .innerJoin(
        table_product_master,
        eq(this.table.productMasterId, table_product_master.id)
      )
      .leftJoin(
        table_product_category,
        eq(table_product_master.categoryId, table_product_category.id)
      )
      .leftJoin(
        table_unit_of_measure,
        eq(this.table.baseUomId, table_unit_of_measure.id)
      )

      .limit(limit)
      .offset(offset);

    // Extract total from first row (same for all rows due to window function)
    const total = products.length > 0 ? products[0].total : 0;

    // Map flat results to nested structure
    const list = products.map((row: (typeof products)[0]) => ({
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
    }));
    return this.getPagination({
      data: list,
      total: total,
    });
  };
}

export default ListProductModel;
