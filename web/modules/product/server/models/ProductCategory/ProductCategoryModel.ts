import { getEnv } from "@base/server";
import { LocaleDataType } from "@base/server/interfaces/Locale";
import { BaseModel } from "@base/server/models/BaseModel";
import { eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { NewProductTbProductCategory, product_tb_product_categories } from "../../schemas";

const parentCategory = alias(product_tb_product_categories, "parent_category");

export interface ProductCategoryRow {
  id: string;
  code: string;
  name?: unknown;
  description?: unknown;
  level?: number;
  isActive?: boolean;
  parent?: {
    id: string;
    name?: unknown;
  } | null;
  createdAt?: number;
  updatedAt?: number;
}

export interface ProductCategoryInput {
  code: string;
  name: LocaleDataType<string>;
  description?: LocaleDataType<string> | null;
  parentId?: string | null;
  level?: number | null;
  isActive?: boolean;
}

export default class ProductCategoryModel extends BaseModel<
  typeof product_tb_product_categories
> {
  constructor() {
    super(product_tb_product_categories);
  }

  private normalizeLocaleInput(value: unknown): LocaleDataType<string> | null {
    if (!value) return null;
    if (typeof value === "string") return { en: value };
    if (typeof value === "object") return value as LocaleDataType<string>;
    return null;
  }

  getCategoryById = async (id: string): Promise<ProductCategoryRow | null> => {
    const result = await this.db
      .select({
        id: this.table.id,
        code: this.table.code,
        name: this.table.name,
        description: this.table.description,
        level: this.table.level,
        isActive: this.table.isActive,
        parentId: this.table.parentId,
        parentName: parentCategory.name,
        createdAt: this.table.createdAt,
        updatedAt: this.table.updatedAt,
      })
      .from(this.table)
      .leftJoin(parentCategory, eq(this.table.parentId, parentCategory.id))
      .where(eq(this.table.id, id))
      .limit(1);

    const row = result[0];

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      code: row.code,
      name: row.name,
      description: row.description,
      level: row.level ?? undefined,
      isActive: row.isActive ?? undefined,
      parent: row.parentId
        ? {
            id: row.parentId,
            name: row.parentName ?? undefined,
          }
        : null,
      createdAt: row.createdAt?.getTime(),
      updatedAt: row.updatedAt?.getTime(),
    };
  };

  // Helper for API dispatcher (getModuleQueryByModel) - expects params object
  getDataById = async (params: {
    id: string;
  }): Promise<ProductCategoryRow | null> => {
    return this.getCategoryById(params.id);
  };

  createCategory = async (
    payload: ProductCategoryInput
  ): Promise<ProductCategoryRow> => {
    const now = new Date();
    const insertData: NewProductTbProductCategory = {
      code: payload.code,
      name: payload.name,
      description: payload.description ?? null,
      parentId: payload.parentId ?? null,
      isActive:
        payload.isActive === undefined || payload.isActive === null
          ? true
          : payload.isActive,
      createdAt: now,
      updatedAt: now,
    };

    if (payload.level !== undefined && payload.level !== null) {
      insertData.level = payload.level;
    }

    const [created] = await this.db
      .insert(this.table)
      .values(insertData)
      .returning({ id: this.table.id });

    if (!created) {
      throw new Error("Failed to create product category");
    }

    const row = await this.getCategoryById(created.id);

    if (!row) {
      throw new Error("Failed to load product category after creation");
    }

    return row;
  };

  updateCategory = async (
    id: string,
    payload: Partial<ProductCategoryInput>
  ): Promise<ProductCategoryRow | null> => {
    const updateData: Partial<typeof this.table.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (payload.code !== undefined) updateData.code = payload.code;
    if (payload.name !== undefined) updateData.name = payload.name;
    if (payload.description !== undefined)
      updateData.description = payload.description ?? null;
    if (payload.parentId !== undefined)
      updateData.parentId = payload.parentId ?? null;
    if (payload.level !== undefined) {
      if (payload.level !== null) {
        updateData.level = payload.level;
      }
    }
    if (payload.isActive !== undefined) updateData.isActive = payload.isActive;

    await this.db.update(this.table).set(updateData).where(eq(this.table.id, id));

    return this.getCategoryById(id);
  };

  /**
   * Wrapper used by getModuleQueryByModel for update via API
   * Accepts raw payload from controller and applies normalization logic.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateData = async (params: { id: string; payload: any }) => {
    const { id, payload } = params;

    const normalizedPayload: Partial<ProductCategoryInput> = {};

    if (payload.code !== undefined) {
      normalizedPayload.code = String(payload.code);
    }
    if (payload.name !== undefined) {
      normalizedPayload.name = this.normalizeLocaleInput(payload.name) ?? {
        en: "",
      };
    }
    if (payload.description !== undefined) {
      normalizedPayload.description = this.normalizeLocaleInput(
        payload.description
      );
    }
    if (payload.parentId !== undefined) {
      normalizedPayload.parentId =
        payload.parentId === null || payload.parentId === ""
          ? null
          : String(payload.parentId);
    }
    if (payload.level !== undefined) {
      normalizedPayload.level =
        payload.level === null || payload.level === ""
          ? null
          : Number(payload.level);
    }
    if (payload.isActive !== undefined) {
      normalizedPayload.isActive = Boolean(payload.isActive);
    }

    return this.updateCategory(id, normalizedPayload);
  };
}
