import { db } from "@serv/db";
import { and, asc, desc, eq, or, sql } from "drizzle-orm/sql";
import omit from "lodash/omit";

import { productVariants } from "../schemas/product-variant";
import { productVariantImages } from "../schemas/product-variant-image";
import { productMasters } from "../schemas/product-master";
import { unitsOfMeasure } from "../schemas/unit-of-measure";
import { ProductVariant as ProductVariantType } from "../../shared/types/ProductVariant";
import { LocaleDataType } from "@/module-base/shared/Locale";
import { ModalController } from "../../../../server/models/ModalController";

interface GetProductVariantListReq {
  productMasterId?: string;
  filters?: Record<string, any>;
  search?: string;
  sorts?: Array<{ field: string; direction: "asc" | "desc" }>;
  offset?: number;
  limit?: number;
}

interface CreateProductVariantReq {
  productMasterId: string;
  name: LocaleDataType<string>;
  description?: LocaleDataType<string>;
  image?: string;
  sku?: string;
  barcode?: string;
  manufacturer?: {
    name?: LocaleDataType<string>;
    code?: string;
  };
  baseUomId?: string;
  isActive?: boolean;
  createdBy?: string;
  updatedBy?: string;
  images?: string[];
}

interface UpdateProductVariantReq extends Partial<CreateProductVariantReq> {
  id: string;
}

class ProductVariantModel extends ModalController {
  public async getProductVariants(params: GetProductVariantListReq) {
    const { productMasterId, filters = {}, search, sorts = [], offset = 0, limit = 10 } = params;
    let query: any = db
      .select({
        id: productVariants.id,
        productMasterId: productVariants.productMasterId,
        name: productVariants.name,
        description: productVariants.description,
        image: productVariants.image,
        sku: productVariants.sku,
        barcode: productVariants.barcode,
        manufacturer: productVariants.manufacturer,
        baseUomId: productVariants.baseUomId,
        isActive: productVariants.isActive,
        createdAt: productVariants.createdAt,
        updatedAt: productVariants.updatedAt,
        createdBy: productVariants.createdBy,
        updatedBy: productVariants.updatedBy,
        total: sql<number>`count(*) OVER()`,
      })
      .from(productVariants);

    // Apply productMasterId filter
    if (productMasterId) {
      query = query.where(eq(productVariants.productMasterId, productMasterId));
    }

    // Apply additional filters
    if (Object.keys(filters).length > 0) {
      const conditions = Object.entries(filters).map(([key, value]) =>
        eq(productVariants[key as keyof typeof productVariants._.columns], value as any),
      );

      const existingWhere = productMasterId ? [eq(productVariants.productMasterId, productMasterId)] : [];
      query = query.where(and(...existingWhere, ...conditions));
    }

    // Apply search
    if (search) {
      query = query.where(
        or(
          sql`${productVariants.sku}::text ILIKE ${"%" + search + "%"}`,
          sql`${productVariants.barcode}::text ILIKE ${"%" + search + "%"}`,
          sql`${productVariants.name}::text ILIKE ${"%" + search + "%"}`,
          sql`${productVariants.description}::text ILIKE ${"%" + search + "%"}`,
        ),
      );
    }

    // Sorting
    if (sorts.length > 0) {
      sorts.forEach(({ field, direction }) => {
        const key = (productVariants as any)?.[field];

        if (!key) return;

        query = query.orderBy(direction === "asc" ? asc(key) : desc(key));
      });
    } else {
      query = query.orderBy(desc(productVariants.createdAt));
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

  public async getProductVariantById(id: string) {
    try {
      const result = await db
        .select()
        .from(productVariants)
        .where(eq(productVariants.id, id))
        .limit(1);

      return result[0] || null;
    } catch (error) {
      console.error("Database query error:", error);
      return null;
    }
  }

  public async createProductVariant(data: CreateProductVariantReq): Promise<ProductVariantType | null> {
    try {
      const now = BigInt(Date.now());

      const result = await db
        .insert(productVariants)
        .values({
          productMasterId: data.productMasterId,
          name: data.name,
          description: data.description,
          image: data.image,
          sku: data.sku,
          barcode: data.barcode,
          manufacturer: data.manufacturer,
          baseUomId: data.baseUomId,
          isActive: data.isActive ?? true,
          createdBy: data.createdBy,
          updatedBy: data.updatedBy,
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      const variant = result[0] as any;

      if (variant?.id && Array.isArray(data.images) && data.images.length > 0) {
        const imagesValues = data.images.map((url, index) => ({
          variantId: variant.id,
          url,
          sortOrder: index,
          isPrimary: index === 0,
          createdAt: now,
          updatedAt: now,
        }));

        await db.insert(productVariantImages).values(imagesValues);
      }

      return variant as unknown as ProductVariantType || null;
    } catch (error) {
      console.error("Database insert error:", error);
      throw error;
    }
  }

  public async updateProductVariant(id: string, data: Partial<UpdateProductVariantReq>) {
    try {
      const now = BigInt(Date.now());

      const result = await db
        .update(productVariants)
        .set({
          ...data,
          updatedAt: now,
        })
        .where(eq(productVariants.id, id))
        .returning();

      return result[0] || null;
    } catch (error) {
      console.error("Database update error:", error);
      throw error;
    }
  }

  public async deleteProductVariant(id: string) {
    try {
      const result = await db
        .delete(productVariants)
        .where(eq(productVariants.id, id))
        .returning();

      return result[0] || null;
    } catch (error) {
      console.error("Database delete error:", error);
      throw error;
    }
  }
}

const productVariantModel = new ProductVariantModel();

export default productVariantModel;

