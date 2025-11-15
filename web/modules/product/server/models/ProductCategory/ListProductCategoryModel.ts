import { getEnv } from "@base/server";
import { BaseViewListModel } from "@base/server/models/BaseViewListModel";
import type {
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

class ListProductCategoryModel extends BaseViewListModel<
  typeof table_product_category,
  ProductCategoryRow
> {
  constructor() {
    super(table_product_category);
  }

  getViewDataList = async (
    params: ListParamsRequest
  ): Promise<ListParamsResponse<ProductCategoryRow>> => {
    const env = getEnv();
    const db = env.getDb();

    const { offset, limit } = this.getDefaultParamsForList(params);

    const categories = await db
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
        total: sql<number>`count(*) over()::int`.as("total"),
      })
      .from(this.table)
      .leftJoin(parentCategory, eq(this.table.parentId, parentCategory.id))
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

export default ListProductCategoryModel;

