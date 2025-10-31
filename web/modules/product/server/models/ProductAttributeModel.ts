import { db } from "@serv/db";
import { and, asc, desc, eq, or, sql } from "drizzle-orm/sql";
import omit from "lodash/omit";

import { productAttributes } from "../schemas/product-attribute";
import { ProductAttribute as ProductAttributeType } from "../../shared/types/ProductAttribute";
import { LocaleDataType } from "@/module-base/shared/Locale";
import { ModalController } from "../../../../server/models/ModalController";

interface GetProductAttributeListReq {
  entityType?: "master" | "variant";
  entityId?: string;
  filters?: Record<string, any>;
  search?: string;
  sorts?: Array<{ field: string; direction: "asc" | "desc" }>;
  offset?: number;
  limit?: number;
}

interface CreateProductAttributeReq {
  entityType: "master" | "variant";
  entityId: string;
  code: string;
  name: LocaleDataType<string>;
  value: string;
}

interface UpdateProductAttributeReq extends Partial<CreateProductAttributeReq> {
  id: string;
}

class ProductAttributeModel extends ModalController {
  public async getProductAttributes(params: GetProductAttributeListReq = {}) {
    const { entityType, entityId, filters = {}, search, sorts = [], offset = 0, limit = 1000 } = params;
    let query: any = db
      .select({
        id: productAttributes.id,
        entityType: productAttributes.entityType,
        entityId: productAttributes.entityId,
        code: productAttributes.code,
        name: productAttributes.name,
        value: productAttributes.value,
        createdAt: productAttributes.createdAt,
        updatedAt: productAttributes.updatedAt,
        total: sql<number>`count(*) OVER()`,
      })
      .from(productAttributes);

    const conditions: any[] = [];

    // Apply entity filters
    if (entityType) {
      conditions.push(eq(productAttributes.entityType, entityType));
    }

    if (entityId) {
      conditions.push(eq(productAttributes.entityId, entityId));
    }

    // Apply additional filters
    if (Object.keys(filters).length > 0) {
      Object.entries(filters).forEach(([key, value]) => {
        conditions.push(eq(productAttributes[key as keyof typeof productAttributes._.columns], value as any));
      });
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply search
    if (search) {
      query = query.where(
        or(
          sql`${productAttributes.code}::text ILIKE ${"%" + search + "%"}`,
          sql`${productAttributes.value}::text ILIKE ${"%" + search + "%"}`,
          sql`${productAttributes.name}::text ILIKE ${"%" + search + "%"}`,
        ),
      );
    }

    // Sorting
    if (sorts.length > 0) {
      sorts.forEach(({ field, direction }) => {
        const key = (productAttributes as any)?.[field];

        if (!key) return;

        query = query.orderBy(direction === "asc" ? asc(key) : desc(key));
      });
    } else {
      query = query.orderBy(asc(productAttributes.code));
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

  public async getProductAttributeById(id: string) {
    try {
      const result = await db
        .select()
        .from(productAttributes)
        .where(eq(productAttributes.id, id))
        .limit(1);

      return result[0] as unknown as ProductAttributeType || null;
    } catch (error) {
      console.error("Database query error:", error);
      return null;
    }
  }

  public async createProductAttribute(data: CreateProductAttributeReq): Promise<ProductAttributeType | null> {
    try {
      const now = BigInt(Date.now());

      const result = await db
        .insert(productAttributes)
        .values({
          entityType: data.entityType,
          entityId: data.entityId,
          code: data.code,
          name: data.name,
          value: data.value,
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      return result[0] as unknown as ProductAttributeType || null;
    } catch (error) {
      console.error("Database insert error:", error);
      throw error;
    }
  }

  public async updateProductAttribute(id: string, data: Partial<UpdateProductAttributeReq>) {
    try {
      const now = BigInt(Date.now());

      const result = await db
        .update(productAttributes)
        .set({
          ...data,
          updatedAt: now,
        })
        .where(eq(productAttributes.id, id))
        .returning();

      return result[0] || null;
    } catch (error) {
      console.error("Database update error:", error);
      throw error;
    }
  }

  public async deleteProductAttribute(id: string) {
    try {
      const result = await db
        .delete(productAttributes)
        .where(eq(productAttributes.id, id))
        .returning();

      return result[0] || null;
    } catch (error) {
      console.error("Database delete error:", error);
      throw error;
    }
  }

  public async deleteAttributesByEntity(entityType: "master" | "variant", entityId: string) {
    try {
      const result = await db
        .delete(productAttributes)
        .where(
          and(
            eq(productAttributes.entityType, entityType),
            eq(productAttributes.entityId, entityId),
          ),
        )
        .returning();

      return result;
    } catch (error) {
      console.error("Database delete error:", error);
      throw error;
    }
  }

  public async createMultipleAttributes(attributes: CreateProductAttributeReq[]) {
    try {
      const now = BigInt(Date.now());

      const values = attributes.map((attr) => ({
        entityType: attr.entityType,
        entityId: attr.entityId,
        code: attr.code,
        name: attr.name,
        value: attr.value,
        createdAt: now,
        updatedAt: now,
      }));

      const result = await db
        .insert(productAttributes)
        .values(values)
        .returning();

      return result;
    } catch (error) {
      console.error("Database insert error:", error);
      throw error;
    }
  }
}

const productAttributeModel = new ProductAttributeModel();

export default productAttributeModel;

