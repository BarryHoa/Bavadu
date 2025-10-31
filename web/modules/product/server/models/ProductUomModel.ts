import { db } from "@serv/db";
import { and, asc, desc, eq, or, sql } from "drizzle-orm/sql";
import omit from "lodash/omit";

import { unitsOfMeasure, uomConversions } from "../schemas/unit-of-measure";
import { UnitOfMeasure, UnitOfMeasureConversion } from "../../shared/types/ProductUom";
import { LocaleDataType } from "@/module-base/shared/Locale";
import { ModalController } from "../../../../server/models/ModalController";

interface GetUomListReq {
  filters?: Record<string, any>;
  search?: string;
  sorts?: Array<{ field: string; direction: "asc" | "desc" }>;
  offset?: number;
  limit?: number;
}

interface CreateUomReq {
  name: LocaleDataType<string>;
  isPrimary?: boolean;
  symbol?: string;
  isActive?: boolean;
}

interface UpdateUomReq extends Partial<CreateUomReq> {
  id: string;
}

interface CreateUomConversionReq {
  uomId: string;
  conversionRatio: number;
}

class ProductUomModel extends ModalController {
  public async getUoms(params: GetUomListReq = {}) {
    const { filters = {}, search, sorts = [], offset = 0, limit = 100 } = params;
    let query: any = db
      .select({
        id: unitsOfMeasure.id,
        name: unitsOfMeasure.name,
        isPrimary: unitsOfMeasure.isPrimary,
        symbol: unitsOfMeasure.symbol,
        isActive: unitsOfMeasure.isActive,
        createdAt: unitsOfMeasure.createdAt,
        updatedAt: unitsOfMeasure.updatedAt,
        total: sql<number>`count(*) OVER()`,
      })
      .from(unitsOfMeasure);

    // Apply filters
    if (Object.keys(filters).length > 0) {
      const conditions = Object.entries(filters).map(([key, value]) =>
        eq(unitsOfMeasure[key as keyof typeof unitsOfMeasure._.columns], value as any),
      );

      query = query.where(and(...conditions));
    }

    // Apply search
    if (search) {
      query = query.where(
        or(
          sql`${unitsOfMeasure.symbol}::text ILIKE ${"%" + search + "%"}`,
          sql`${unitsOfMeasure.name}::text ILIKE ${"%" + search + "%"}`,
        ),
      );
    }

    // Sorting
    if (sorts.length > 0) {
      sorts.forEach(({ field, direction }) => {
        const key = (unitsOfMeasure as any)?.[field];

        if (!key) return;

        query = query.orderBy(direction === "asc" ? asc(key) : desc(key));
      });
    } else {
      query = query.orderBy(asc(unitsOfMeasure.isPrimary), asc(unitsOfMeasure.symbol));
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

  public async getUomById(id: string) {
    try {
      const result = await db
        .select()
        .from(unitsOfMeasure)
        .where(eq(unitsOfMeasure.id, id))
        .limit(1);

      return result[0] as unknown as UnitOfMeasure || null;
    } catch (error) {
      console.error("Database query error:", error);
      return null;
    }
  }

  public async createUom(data: CreateUomReq): Promise<UnitOfMeasure | null> {
    try {
      const now = BigInt(Date.now());

      const result = await db
        .insert(unitsOfMeasure)
        .values({
          name: data.name,
          isPrimary: data.isPrimary ?? false,
          symbol: data.symbol,
          isActive: data.isActive ?? true,
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      return result[0] as unknown as UnitOfMeasure || null;
    } catch (error) {
      console.error("Database insert error:", error);
      throw error;
    }
  }

  public async updateUom(id: string, data: Partial<UpdateUomReq>) {
    try {
      const now = BigInt(Date.now());

      const result = await db
        .update(unitsOfMeasure)
        .set({
          ...data,
          updatedAt: now,
        })
        .where(eq(unitsOfMeasure.id, id))
        .returning();

      return result[0] || null;
    } catch (error) {
      console.error("Database update error:", error);
      throw error;
    }
  }

  public async deleteUom(id: string) {
    try {
      const result = await db
        .delete(unitsOfMeasure)
        .where(eq(unitsOfMeasure.id, id))
        .returning();

      return result[0] || null;
    } catch (error) {
      console.error("Database delete error:", error);
      throw error;
    }
  }

  // UOM Conversion methods
  public async getUomConversionsByUomId(uomId: string) {
    try {
      const result = await db
        .select()
        .from(uomConversions)
        .where(eq(uomConversions.uomId, uomId));

      return result as unknown as UnitOfMeasureConversion[];
    } catch (error) {
      console.error("Database query error:", error);
      return [];
    }
  }

  public async createUomConversion(data: CreateUomConversionReq): Promise<UnitOfMeasureConversion | null> {
    try {
      const now = BigInt(Date.now());

      const result = await db
        .insert(uomConversions)
        .values({
          uomId: data.uomId,
          conversionRatio: data.conversionRatio,
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      return result[0] as UnitOfMeasureConversion || null;
    } catch (error) {
      console.error("Database insert error:", error);
      throw error;
    }
  }

  public async deleteUomConversion(id: string) {
    try {
      const result = await db
        .delete(uomConversions)
        .where(eq(uomConversions.id, id))
        .returning();

      return result[0] || null;
    } catch (error) {
      console.error("Database delete error:", error);
      throw error;
    }
  }
}

const productUomModel = new ProductUomModel();

export default productUomModel;

