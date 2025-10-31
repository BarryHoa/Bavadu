import { db } from "@serv/db";
import { and, asc, desc, eq, or, sql } from "drizzle-orm/sql";
import omit from "lodash/omit";
import { v4 as uuidv4 } from "uuid";

import { productMasters } from "../schemas/product-master";
import { productCategories } from "../schemas/product-category";
import { MasterProduct, MasterProductId } from "../../shared/types/ProductMaster";
import { LocaleDataType } from "@/module-base/shared/Locale";
import { ModalController } from "../../../../server/models/ModalController";

interface GetProductMasterListReq {
  filters?: Record<string, any>;
  search?: string;
  sorts?: Array<{ field: string; direction: "asc" | "desc" }>;
  offset?: number;
  limit?: number;
}

interface CreateProductMasterReq {
  code: string;
  name: LocaleDataType<string>;
  image?: string;
  description?: LocaleDataType<string>;
  type: string;
  features?: Record<string, boolean>;
  isActive?: boolean;
  brand?: LocaleDataType<string>;
  categoryId?: string;
  createdBy?: string;
  updatedBy?: string;
}

interface UpdateProductMasterReq extends Partial<CreateProductMasterReq> {
  id: string;
}

class ProductMasterModel extends ModalController {
  public async getProductMasters(params: GetProductMasterListReq) {
    const { filters = {}, search, sorts = [], offset = 0, limit = 10 } = params;
    let query: any = db
      .select({
        id: productMasters.id,
        code: productMasters.code,
        name: productMasters.name,
        image: productMasters.image,
        description: productMasters.description,
        type: productMasters.type,
        features: productMasters.features,
        isActive: productMasters.isActive,
        brand: productMasters.brand,
        categoryId: productMasters.categoryId,
        createdAt: productMasters.createdAt,
        updatedAt: productMasters.updatedAt,
        createdBy: productMasters.createdBy,
        updatedBy: productMasters.updatedBy,
        total: sql<number>`count(*) OVER()`,
      })
      .from(productMasters);

    // Apply filters
    if (Object.keys(filters).length > 0) {
      const conditions = Object.entries(filters).map(([key, value]) =>
        eq(productMasters[key as keyof typeof productMasters._.columns], value as any),
      );

      query = query.where(and(...conditions));
    }

    // Apply search
    if (search) {
      query = query.where(
        or(
          sql`${productMasters.code}::text ILIKE ${"%" + search + "%"}`,
          sql`${productMasters.name}::text ILIKE ${"%" + search + "%"}`,
          sql`${productMasters.description}::text ILIKE ${"%" + search + "%"}`,
        ),
      );
    }

    // Sorting
    if (sorts.length > 0) {
      sorts.forEach(({ field, direction }) => {
        const key = (productMasters as any)?.[field];

        if (!key) return;

        query = query.orderBy(direction === "asc" ? asc(key) : desc(key));
      });
    } else {
      query = query.orderBy(desc(productMasters.createdAt));
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

  public async getProductMasterById(id: MasterProductId) {
    try {
      const result = await db
        .select()
        .from(productMasters)
        .where(eq(productMasters.id, id))
        .limit(1);

      return result[0] || null;
    } catch (error) {
      console.error("Database query error:", error);
      return null;
    }
  }

  public async createProductMaster(data: CreateProductMasterReq): Promise<MasterProduct | null> {
    try {
      const now = BigInt(Date.now());
      
      const result = await db
        .insert(productMasters)
        .values({
          code: data.code,
          name: data.name,
          image: data.image,
          description: data.description,
          type: data.type,
          features: data.features,
          isActive: data.isActive ?? true,
          brand: data.brand,
          categoryId: data.categoryId,
          createdBy: data.createdBy,
          updatedBy: data.updatedBy,
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      return result[0] as unknown as MasterProduct || null;
    } catch (error) {
      console.error("Database insert error:", error);
      throw error;
    }
  }

  public async updateProductMaster(id: MasterProductId, data: Partial<UpdateProductMasterReq>) {
    try {
      const now = BigInt(Date.now());

      const result = await db
        .update(productMasters)
        .set({
          ...data,
          updatedAt: now,
        })
        .where(eq(productMasters.id, id))
        .returning();

      return result[0] || null;
    } catch (error) {
      console.error("Database update error:", error);
      throw error;
    }
  }

  public async deleteProductMaster(id: MasterProductId) {
    try {
      const result = await db
        .delete(productMasters)
        .where(eq(productMasters.id, id))
        .returning();

      return result[0] || null;
    } catch (error) {
      console.error("Database delete error:", error);
      throw error;
    }
  }
}

const productMasterModel = new ProductMasterModel();

export default productMasterModel;

