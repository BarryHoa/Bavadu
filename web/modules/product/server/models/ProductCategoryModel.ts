import { db } from "@serv/db";
import { and, asc, desc, eq, or, sql } from "drizzle-orm/sql";
import omit from "lodash/omit";

import { productCategories } from "../schemas/product-category";
import { ProductCategory as ProductCategoryType, ProductCategoryId } from "../../shared/types/ProductCategory";
import { LocaleDataType } from "@/module-base/shared/Locale";
import { ModalController } from "../../../../server/models/ModalController";

interface GetProductCategoryListReq {
  parentId?: string | null;
  filters?: Record<string, any>;
  search?: string;
  sorts?: Array<{ field: string; direction: "asc" | "desc" }>;
  offset?: number;
  limit?: number;
}

interface CreateProductCategoryReq {
  code: string;
  name: LocaleDataType<string>;
  description?: LocaleDataType<string>;
  parentId?: ProductCategoryId;
  level?: number;
  isActive?: boolean;
  createdBy?: string;
  updatedBy?: string;
}

interface UpdateProductCategoryReq extends Partial<CreateProductCategoryReq> {
  id: string;
}

class ProductCategoryModel extends ModalController {
  public async getProductCategories(params: GetProductCategoryListReq = {}) {
    const { parentId, filters = {}, search, sorts = [], offset = 0, limit = 10 } = params;
    let query: any = db
      .select({
        id: productCategories.id,
        code: productCategories.code,
        name: productCategories.name,
        description: productCategories.description,
        parentId: productCategories.parentId,
        level: productCategories.level,
        isActive: productCategories.isActive,
        createdAt: productCategories.createdAt,
        updatedAt: productCategories.updatedAt,
        createdBy: productCategories.createdBy,
        updatedBy: productCategories.updatedBy,
        total: sql<number>`count(*) OVER()`,
      })
      .from(productCategories);

    const conditions: any[] = [];

    // Apply parentId filter
    if (parentId !== undefined) {
      if (parentId === null) {
        conditions.push(sql`${productCategories.parentId} IS NULL`);
      } else {
        conditions.push(eq(productCategories.parentId, parentId));
      }
    }

    // Apply additional filters
    if (Object.keys(filters).length > 0) {
      Object.entries(filters).forEach(([key, value]) => {
        conditions.push(eq(productCategories[key as keyof typeof productCategories._.columns], value as any));
      });
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply search
    if (search) {
      query = query.where(
        or(
          sql`${productCategories.code}::text ILIKE ${"%" + search + "%"}`,
          sql`${productCategories.name}::text ILIKE ${"%" + search + "%"}`,
          sql`${productCategories.description}::text ILIKE ${"%" + search + "%"}`,
        ),
      );
    }

    // Sorting
    if (sorts.length > 0) {
      sorts.forEach(({ field, direction }) => {
        const key = (productCategories as any)?.[field];

        if (!key) return;

        query = query.orderBy(direction === "asc" ? asc(key) : desc(key));
      });
    } else {
      query = query.orderBy(asc(productCategories.level), asc(productCategories.code));
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
    const data = isHasData ? omit(rows, ["total"]) : [];

    return this.getPagination({ data, total });
  }

  public async getProductCategoryById(id: ProductCategoryId) {
    try {
      const result = await db
        .select()
        .from(productCategories)
        .where(eq(productCategories.id, id))
        .limit(1);

      return result[0] || null;
    } catch (error) {
      console.error("Database query error:", error);
      return null;
    }
  }

  public async createProductCategory(data: CreateProductCategoryReq): Promise<ProductCategoryType | null> {
    try {
      const now = BigInt(Date.now());

      // If parentId is provided, get the parent's level
      let level = data.level ?? 1;
      if (data.parentId) {
        const parent = await this.getProductCategoryById(data.parentId);
        if (parent) {
          level = parent.level + 1;
        }
      }

      const result = await db
        .insert(productCategories)
        .values({
          code: data.code,
          name: data.name,
          description: data.description,
          parentId: data.parentId,
          level,
          isActive: data.isActive ?? true,
          createdBy: data.createdBy,
          updatedBy: data.updatedBy,
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      return result[0] as unknown as ProductCategoryType || null;
    } catch (error) {
      console.error("Database insert error:", error);
      throw error;
    }
  }

  public async updateProductCategory(id: ProductCategoryId, data: Partial<UpdateProductCategoryReq>) {
    try {
      const now = BigInt(Date.now());

      // If parentId is being updated, recalculate level
      if (data.parentId !== undefined) {
        let level = 1;
        if (data.parentId) {
          const parent = await this.getProductCategoryById(data.parentId);
          if (parent) {
            level = parent.level + 1;
          }
        }
        data.level = level;
      }

      const result = await db
        .update(productCategories)
        .set({
          ...data,
          updatedAt: now,
        })
        .where(eq(productCategories.id, id))
        .returning();

      return result[0] || null;
    } catch (error) {
      console.error("Database update error:", error);
      throw error;
    }
  }

  public async deleteProductCategory(id: ProductCategoryId) {
    try {
      // Check if category has children
      const children = await this.getProductCategories({ parentId: id });
      if (children.total > 0) {
        throw new Error("Cannot delete category with children");
      }

      const result = await db
        .delete(productCategories)
        .where(eq(productCategories.id, id))
        .returning();

      return result[0] || null;
    } catch (error) {
      console.error("Database delete error:", error);
      throw error;
    }
  }

  public async getCategoryTree(parentId: ProductCategoryId | null = null) {
    try {
      const result = await db
        .select()
        .from(productCategories)
        .where(parentId ? eq(productCategories.parentId, parentId) : sql`${productCategories.parentId} IS NULL`)
        .orderBy(asc(productCategories.level), asc(productCategories.code));

      return result;
    } catch (error) {
      console.error("Database query error:", error);
      return [];
    }
  }
}

const productCategoryModel = new ProductCategoryModel();

export default productCategoryModel;

