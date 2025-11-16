import { BaseViewListModel } from "@base/server/models/BaseViewListModel";
import type {
  ListParamsRequest,
  ListParamsResponse,
} from "@base/server/models/interfaces/ListInterface";
import type { Column } from "drizzle-orm";
import { eq, ilike } from "drizzle-orm";
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
  protected declarationColumns() {
    return new Map<
      string,
      {
        column: Column<any>;
        sort?: boolean;
      }
    >([
      ["id", { column: table_product_category.id, sort: true }],
      ["code", { column: table_product_category.code, sort: true }],
      ["name", { column: table_product_category.name, sort: true }],
      [
        "description",
        { column: table_product_category.description, sort: false },
      ],
      ["level", { column: table_product_category.level, sort: true }],
      ["isActive", { column: table_product_category.isActive, sort: true }],
      ["parentId", { column: table_product_category.parentId, sort: true }],
      ["createdAt", { column: table_product_category.createdAt, sort: true }],
      ["updatedAt", { column: table_product_category.updatedAt, sort: true }],
    ]);
  }

  constructor() {
    super({ table: table_product_category });
  }

  protected declarationSearch() {
    return [
      (text: string) => ilike(table_product_category.code, text),
      (text: string) => ilike(table_product_category.name, text),
    ];
  }

  protected declarationFilter() {
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected declarationMappingData(row: any): ProductCategoryRow {
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
  }

  getData = async (
    params: ListParamsRequest
  ): Promise<ListParamsResponse<ProductCategoryRow>> => {
    return this.buildQueryDataList(params, (query) =>
      query.leftJoin(parentCategory, eq(this.table.parentId, parentCategory.id))
    );
  };
}

export default ListProductCategoryModel;
