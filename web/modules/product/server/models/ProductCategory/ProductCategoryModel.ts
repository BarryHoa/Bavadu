import { BaseModel } from "@/module-base/server/models/BaseModel";
import { getEnv } from "@base/server";
import {
  ListParamsRequest,
  ListParamsResponse,
} from "@base/server/models/interfaces/ListInterface";
import { eq, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { table_product_category } from "../../schemas";

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
}
