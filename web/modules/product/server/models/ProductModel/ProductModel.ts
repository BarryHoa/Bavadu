import { BaseModel } from "@/module-base/server/models/BaseModel";
import { db } from "@/server/db";
import { eq, sql } from "drizzle-orm";

import { ListParamsRequest, ListParamsResponse } from "@/module-base/server";
import { table_product_category } from "../../schemas";
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
    super("product.variant");
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
    const products = await db
      .select()
      .from(table_product_master)
      .where(eq(table_product_master.id, id))
      .limit(1);

    if (products.length === 0) {
      return null;
    }

    return this.mapToMasterProduct(products[0]);
  };

  getProducts = async (
    params: ListParamsRequest<ProductFilter>
  ): Promise<ListParamsResponse<ProductVariantElm>> => {
    const { offset, limit, search, filters, sorts } =
      this.getDefaultParamsForList(params);

    // build select
    const selectProductMaster = {
      id: table_product_master.id,
      name: table_product_master.name,
      type: table_product_master.type,
      features: table_product_master.features,
      category: {
        id: table_product_category.id,
        name: table_product_category.name,
        code: table_product_category.code,
      },
      brand: table_product_master.brand,
    };
    const selectProductVariant = {
      id: table_product_variant.id,
      name: table_product_variant.name,
      description: table_product_variant.description,
      images: table_product_variant.images,
      sku: table_product_variant.sku,
      barcode: table_product_variant.barcode,
      manufacturer: table_product_variant.manufacturer,
      // baseUom: table_product_variant.baseUom,
      isActive: table_product_variant.isActive,
      createdAt: table_product_variant.createdAt,
      updatedAt: table_product_variant.updatedAt,
      createdBy: table_product_variant.createdBy,
      updatedBy: table_product_variant.updatedBy,
      productMaster: selectProductMaster,
      brand: table_product_master.brand,
      features: table_product_master.features,
    };
    // Lấy tổng số sản phẩm trước khi áp dụng limit/offset

    // Query both data and total in two steps since window functions and .fn are not supported in this setup
    const productMasterQuery = db
      .select(selectProductMaster)
      .from(table_product_master)
      .leftJoin(
        table_product_category,
        eq(table_product_master.categoryId, table_product_category.id)
      )
      .as("productMaster");

    // Step 1: Query paginated data

    const productsQuery = db
      .select()
      .from(table_product_variant)
      .innerJoinLateral(
        productMasterQuery,
        sql`product_variants.product_master_id = productMaster.id`
      )
      .limit(limit)
      .offset(offset);

    const list = await productsQuery;

    return this.getPagination({
      data: list,
      total: list.length,
    });
  };
}

export default new ProductModel();
