import { BaseModel } from "@/module-base/server/models/BaseModel";
import { eq, sql } from "drizzle-orm";

import { getEnv } from "@base/server";
import {
  ListParamsRequest,
  ListParamsResponse,
} from "@base/server/models/interfaces/ListInterface";
import { table_product_category, table_unit_of_measure } from "../../schemas";
import {
  table_product_master,
  TblProductMaster,
} from "../../schemas/product-master";
import { table_product_variant } from "../../schemas/product-variant";
import { MasterProduct } from "../interfaces/ProductMaster";
import {
  ProductFilter,
  ProductModelInterface,
  ProductVariantElm,
} from "./ProductModelInterface";

class ProductModel extends BaseModel implements ProductModelInterface {
  constructor() {
    super();
  }

  private mapToMasterProduct(dbProduct: TblProductMaster): MasterProduct {
    return {
      id: dbProduct.id,
      code: dbProduct.code,
      name: dbProduct.name as MasterProduct["name"],
      type: dbProduct.type as MasterProduct["type"],
      features: dbProduct.features as MasterProduct["features"],
      isActive: dbProduct.isActive,
      brand: dbProduct.brand as MasterProduct["brand"],
      createdAt: dbProduct.createdAt?.getTime(),
      updatedAt: dbProduct.updatedAt?.getTime(),
      // Note: createdBy and updatedBy are stored as user IDs (strings) in DB
      // They would need to be resolved to User objects if needed
      // For now, we omit them as they're optional
    };
  }

  getProductById = async (id: string): Promise<MasterProduct | null> => {
    const env = getEnv();
    const products = await env
      .getDb()
      .select()
      .from(table_product_master)
      .where(eq(table_product_master.id, id))
      .limit(1);

    if (products.length === 0) {
      return null;
    }

    return this.mapToMasterProduct(products[0]);
  };

  //handle for view data table list
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
        id: table_product_variant.id,
        name: table_product_variant.name,
        description: table_product_variant.description,
        sku: table_product_variant.sku,
        barcode: table_product_variant.barcode,
        manufacturer: table_product_variant.manufacturer,
        images: table_product_variant.images,
        isActive: table_product_variant.isActive,
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
        baseUomId: table_product_variant.baseUomId,
        baseUomName: table_unit_of_measure.name,

        createdAt: table_product_variant.createdAt,
        updatedAt: table_product_variant.updatedAt,
        // Total count using window function (same for all rows)
        total: sql<number>`count(*) over()::int`.as("total"),
      })
      .from(table_product_variant)
      .innerJoin(
        table_product_master,
        eq(table_product_variant.productMasterId, table_product_master.id)
      )
      .leftJoin(
        table_product_category,
        eq(table_product_master.categoryId, table_product_category.id)
      )
      .leftJoin(
        table_unit_of_measure,
        eq(table_product_variant.baseUomId, table_unit_of_measure.id)
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
export default ProductModel;

// export default new ProductModel();
