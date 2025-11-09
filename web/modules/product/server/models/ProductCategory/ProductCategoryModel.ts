import { getEnv } from "@base/server";
import { LocaleDataType } from "@base/server/interfaces/Locale";
import { BaseModel } from "@base/server/models/BaseModel";
import {
  ListParamsRequest,
  ListParamsResponse,
} from "@base/server/models/interfaces/ListInterface";
import { eq, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { NewTblProductCategory, table_product_category } from "../../schemas";

const parentCategory = alias(table_product_category, "parent_category");

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

export default class ProductCategoryModel extends BaseModel {
  constructor() {
    super();
  }

  getViewDataList = async (
    params: ListParamsRequest
  ): Promise<ListParamsResponse<ProductCategoryRow>> => {
    const env = getEnv();
    const db = env.getDb();

    const { offset, limit } = this.getDefaultParamsForList(params);

    const categories = await db
      .select({
        id: table_product_category.id,
        code: table_product_category.code,
        name: table_product_category.name,
        description: table_product_category.description,
        level: table_product_category.level,
        isActive: table_product_category.isActive,
        parentId: table_product_category.parentId,
        parentName: parentCategory.name,
        createdAt: table_product_category.createdAt,
        updatedAt: table_product_category.updatedAt,
        total: sql<number>`count(*) over()::int`.as("total"),
      })
      .from(table_product_category)
      .leftJoin(
        parentCategory,
        eq(table_product_category.parentId, parentCategory.id)
      )
      .limit(limit)
      .offset(offset);

    const total = categories.length > 0 ? categories[0].total : 0;

    const list: ProductCategoryRow[] = categories.map((row) => ({
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
    }));

    return this.getPagination({ data: list, total });
  };

  getCategoryById = async (id: string): Promise<ProductCategoryRow | null> => {
    const env = getEnv();
    const db = env.getDb();

    const result = await db
      .select({
        id: table_product_category.id,
        code: table_product_category.code,
        name: table_product_category.name,
        description: table_product_category.description,
        level: table_product_category.level,
        isActive: table_product_category.isActive,
        parentId: table_product_category.parentId,
        parentName: parentCategory.name,
        createdAt: table_product_category.createdAt,
        updatedAt: table_product_category.updatedAt,
      })
      .from(table_product_category)
      .leftJoin(
        parentCategory,
        eq(table_product_category.parentId, parentCategory.id)
      )
      .where(eq(table_product_category.id, id))
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

  createCategory = async (
    payload: ProductCategoryInput
  ): Promise<ProductCategoryRow> => {
    const env = getEnv();
    const db = env.getDb();

    const now = new Date();
    const insertData: NewTblProductCategory = {
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

    const [created] = await db
      .insert(table_product_category)
      .values(insertData)
      .returning({ id: table_product_category.id });

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
    const env = getEnv();
    const db = env.getDb();

    const updateData: Partial<typeof table_product_category.$inferInsert> = {
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

    await db
      .update(table_product_category)
      .set(updateData)
      .where(eq(table_product_category.id, id));

    return this.getCategoryById(id);
  };
}
