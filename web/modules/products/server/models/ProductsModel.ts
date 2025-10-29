import { db } from "@serv/db";
import { and, asc, desc, eq, or, sql } from "drizzle-orm/sql";
import omit from "lodash/omit";

import {
  products,
  productCategories,
  brands,
  unitsOfMeasure,
} from "../schemas/product";
import {
  GetProductListReq,
  CreateProductRequest,
  UpdateProductRequest,
} from "../../shared/types/ProductTypes";
import { ModalController } from "../../../../server/models/ModalController";

class ProductsModel extends ModalController {
  public async getProducts(params: GetProductListReq) {
    const { filters = {}, search, sorts = [], offset = 0, limit = 10 } = params;
    let query: any = db
      .select({
        id: products.id,
        code: products.code,
        name: products.name,
        description: products.description,
        productType: products.productType,
        categoryId: products.categoryId,
        brandId: products.brandId,
        unitOfMeasureId: products.unitOfMeasureId,
        isActive: products.isActive,
        isVariantEnabled: products.isVariantEnabled,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        createdBy: products.createdBy,
        updatedBy: products.updatedBy,
        total: sql<number>`count(*) OVER()`,
      })
      .from(products);

    // Apply filters
    if (Object.keys(filters).length > 0) {
      const conditions = Object.entries(filters).map(([key, value]) =>
        eq(products[key as keyof typeof products._.columns], value as any),
      );

      query = query.where(and(...conditions));
    }

    // Apply search
    if (search) {
      query = query.where(
        or(
          sql`${products.code} ILIKE ${"%" + search + "%"}`,
          sql`${products.name} ILIKE ${"%" + search + "%"}`,
          sql`${products.description} ILIKE ${"%" + search + "%"}`,
        ),
      );
    }

    // Sorting
    if (sorts.length > 0) {
      sorts.forEach(({ field, direction }) => {
        // check field in products table
        const key = (products as any)?.[field];

        if (!key) return;

        query = query.orderBy(direction === "asc" ? asc(key) : desc(key));
      });
    } else {
      query = query.orderBy(desc(products.createdAt));
    }

    // Pagination
    query = query.limit(limit).offset(offset);

    let rows = [];

    try {
      rows = await query;
    } catch (error) {
      console.error("Database query error:", error);
    }

    const isHasData = rows?.length > 0;

    const total = isHasData ? Number(rows[0].total) : 0;

    const data = isHasData ? omit(rows, ["total"]) : 0;

    return {
      data: data,
      total,
    };
  }

  public async getProductById(id: number) {
    try {
      const result = await db
        .select()
        .from(products)
        .where(eq(products.id, id))
        .limit(1);

      return result[0] || null;
    } catch (error) {
      console.error("Database query error:", error);

      return null;
    }
  }

  public async createProduct(data: CreateProductRequest) {
    try {
      const result = await db
        .insert(products)
        .values({
          code: data.code,
          name: data.name,
          description: data.description,
          productType: data.productType,
          categoryId: data.categoryId,
          brandId: data.brandId,
          unitOfMeasureId: data.unitOfMeasureId,
          isActive: data.isActive ?? true,
          isVariantEnabled: data.isVariantEnabled ?? false,
        })
        .returning();

      return result[0] || null;
    } catch (error) {
      console.error("Database insert error:", error);
      throw error;
    }
  }

  public async updateProduct(id: number, data: UpdateProductRequest) {
    try {
      const result = await db
        .update(products)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(products.id, id))
        .returning();

      return result[0] || null;
    } catch (error) {
      console.error("Database update error:", error);
      throw error;
    }
  }

  public async deleteProduct(id: number) {
    try {
      const result = await db
        .delete(products)
        .where(eq(products.id, id))
        .returning();

      return result[0] || null;
    } catch (error) {
      console.error("Database delete error:", error);
      throw error;
    }
  }

  // Product Categories
  public async getProductCategories() {
    try {
      const result = await db
        .select()
        .from(productCategories)
        .where(eq(productCategories.isActive, true))
        .orderBy(asc(productCategories.name));

      return result;
    } catch (error) {
      console.error("Database query error:", error);

      return [];
    }
  }

  // Brands
  public async getBrands() {
    try {
      const result = await db
        .select()
        .from(brands)
        .where(eq(brands.isActive, true))
        .orderBy(asc(brands.name));

      return result;
    } catch (error) {
      console.error("Database query error:", error);

      return [];
    }
  }

  // Units of Measure
  public async getUnitsOfMeasure() {
    try {
      const result = await db
        .select()
        .from(unitsOfMeasure)
        .where(eq(unitsOfMeasure.isActive, true))
        .orderBy(asc(unitsOfMeasure.name));

      return result;
    } catch (error) {
      console.error("Database query error:", error);

      return [];
    }
  }
}

const productsModel = new ProductsModel();

export default productsModel;
