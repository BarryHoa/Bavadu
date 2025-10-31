import { db } from "@serv/db";
import { and, asc, desc, eq, or, sql } from "drizzle-orm/sql";
import omit from "lodash/omit";

import { productPackings } from "../schemas/product-packing";
import { ProductPacking as ProductPackingType } from "../../shared/types/ProductPacking";
import { LocaleDataType } from "@/module-base/shared/Locale";
import { ModalController } from "../../../../server/models/ModalController";

interface GetProductPackingListReq {
  filters?: Record<string, any>;
  search?: string;
  sorts?: Array<{ field: string; direction: "asc" | "desc" }>;
  offset?: number;
  limit?: number;
}

interface CreateProductPackingReq {
  name: LocaleDataType<string>;
  description?: LocaleDataType<string>;
  isActive?: boolean;
  createdBy?: string;
  updatedBy?: string;
}

interface UpdateProductPackingReq extends Partial<CreateProductPackingReq> {
  id: string;
}

class ProductPackingModel extends ModalController {
  public async getProductPackings(params: GetProductPackingListReq = {}) {
    const { filters = {}, search, sorts = [], offset = 0, limit = 100 } = params;
    let query: any = db
      .select({
        id: productPackings.id,
        name: productPackings.name,
        description: productPackings.description,
        isActive: productPackings.isActive,
        createdAt: productPackings.createdAt,
        updatedAt: productPackings.updatedAt,
        createdBy: productPackings.createdBy,
        updatedBy: productPackings.updatedBy,
        total: sql<number>`count(*) OVER()`,
      })
      .from(productPackings);

    // Apply filters
    if (Object.keys(filters).length > 0) {
      const conditions = Object.entries(filters).map(([key, value]) =>
        eq(productPackings[key as keyof typeof productPackings._.columns], value as any),
      );

      query = query.where(and(...conditions));
    }

    // Apply search
    if (search) {
      query = query.where(
        or(
          sql`${productPackings.name}::text ILIKE ${"%" + search + "%"}`,
          sql`${productPackings.description}::text ILIKE ${"%" + search + "%"}`,
        ),
      );
    }

    // Sorting
    if (sorts.length > 0) {
      sorts.forEach(({ field, direction }) => {
        const key = (productPackings as any)?.[field];

        if (!key) return;

        query = query.orderBy(direction === "asc" ? asc(key) : desc(key));
      });
    } else {
      query = query.orderBy(desc(productPackings.createdAt));
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

  public async getProductPackingById(id: string) {
    try {
      const result = await db
        .select()
        .from(productPackings)
        .where(eq(productPackings.id, id))
        .limit(1);

      return result[0] as unknown as ProductPackingType || null;
    } catch (error) {
      console.error("Database query error:", error);
      return null;
    }
  }

  public async createProductPacking(data: CreateProductPackingReq): Promise<ProductPackingType | null> {
    try {
      const now = BigInt(Date.now());

      const result = await db
        .insert(productPackings)
        .values({
          name: data.name,
          description: data.description,
          isActive: data.isActive ?? true,
          createdBy: data.createdBy,
          updatedBy: data.updatedBy,
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      return result[0] as unknown as ProductPackingType || null;
    } catch (error) {
      console.error("Database insert error:", error);
      throw error;
    }
  }

  public async updateProductPacking(id: string, data: Partial<UpdateProductPackingReq>) {
    try {
      const now = BigInt(Date.now());

      const result = await db
        .update(productPackings)
        .set({
          ...data,
          updatedAt: now,
        })
        .where(eq(productPackings.id, id))
        .returning();

      return result[0] || null;
    } catch (error) {
      console.error("Database update error:", error);
      throw error;
    }
  }

  public async deleteProductPacking(id: string) {
    try {
      const result = await db
        .delete(productPackings)
        .where(eq(productPackings.id, id))
        .returning();

      return result[0] || null;
    } catch (error) {
      console.error("Database delete error:", error);
      throw error;
    }
  }
}

const productPackingModel = new ProductPackingModel();

export default productPackingModel;

