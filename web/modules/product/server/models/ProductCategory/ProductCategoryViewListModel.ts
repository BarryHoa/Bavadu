import type { ParamFilter } from "@base/shared/interface/FilterInterface";
import type {
  ListParamsRequest,
  ListParamsResponse,
} from "@base/shared/interface/ListInterface";
import type { Column } from "drizzle-orm";

import { eq, ilike } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { PermissionRequired } from "@base/server/models/BaseModel";
import {
  BaseViewListModel,
  type FilterConditionMap,
} from "@base/server/models/BaseViewListModel";

import { product_tb_product_categories } from "../../schemas";

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

class ProductCategoryViewListModel extends BaseViewListModel<
  typeof product_tb_product_categories,
  ProductCategoryRow
> {
  protected declarationColumns = () =>
    new Map<
      string,
      {
        column: Column<any>;
        sort?: boolean;
      }
    >([
      ["id", { column: product_tb_product_categories.id, sort: true }],
      ["code", { column: product_tb_product_categories.code, sort: true }],
      ["name", { column: product_tb_product_categories.name, sort: true }],
      [
        "description",
        { column: product_tb_product_categories.description, sort: false },
      ],
      ["level", { column: product_tb_product_categories.level, sort: true }],
      [
        "isActive",
        { column: product_tb_product_categories.isActive, sort: true },
      ],
      [
        "parentId",
        { column: product_tb_product_categories.parentId, sort: true },
      ],
      [
        "createdAt",
        { column: product_tb_product_categories.createdAt, sort: true },
      ],
      [
        "updatedAt",
        { column: product_tb_product_categories.updatedAt, sort: true },
      ],
    ]);

  constructor() {
    super({ table: product_tb_product_categories });
  }

  protected declarationSearch = () =>
    new Map([
      [
        "code",
        (text: string) => ilike(product_tb_product_categories.code, text),
      ],
      [
        "name",
        (text: string) => ilike(product_tb_product_categories.name, text),
      ],
    ]);

  protected declarationFilter = (): FilterConditionMap<ParamFilter> =>
    new Map() as FilterConditionMap<ParamFilter>;

  protected declarationMappingData = (row: any): ProductCategoryRow => ({
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
  });

  @PermissionRequired({
    auth: true,
    permissions: ["product.product-category.view"],
  })
  getData = async (
    params: ListParamsRequest,
  ): Promise<ListParamsResponse<ProductCategoryRow>> => {
    return this.buildQueryDataList(params, (query) =>
      query.leftJoin(
        parentCategory,
        eq(this.table.parentId, parentCategory.id),
      ),
    );
  };
}

export default ProductCategoryViewListModel;
