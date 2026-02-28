import type {
  ListParamsRequest,
  ListParamsResponse,
} from "@base/shared/interface/ListInterface";
import type { RoleRow } from "./RoleAndPermissionModel";

import { eq, ilike, sql } from "drizzle-orm";

import { PermissionRequired } from "@base/server/models/BaseModel";
import {
  BaseViewListModel,
  type ColumnMap,
  type FilterConditionMap,
  type SearchConditionMap,
} from "@base/server/models/BaseViewListModel";
import { ParamFilter } from "@base/shared/interface/FilterInterface";

import { base_tb_roles } from "../../schemas/base.role";

class RoleViewListModel extends BaseViewListModel<
  typeof base_tb_roles,
  RoleRow
> {
  constructor() {
    super({
      table: base_tb_roles,
      sortDefault: [
        { column: "isSystem", direction: "descending" },
        { column: "createdAt", direction: "descending" },
      ],
    });
  }

  protected declarationColumns = (): ColumnMap =>
    new Map([
      ["id", { column: base_tb_roles.id, sort: false }],
      ["code", { column: base_tb_roles.code, sort: true }],
      ["name", { column: base_tb_roles.name, sort: false }],
      ["description", { column: base_tb_roles.description, sort: false }],
      ["isSystem", { column: base_tb_roles.isSystem, sort: true }],
      ["isActive", { column: base_tb_roles.isActive, sort: true }],
      ["createdAt", { column: base_tb_roles.createdAt, sort: true }],
      ["updatedAt", { column: base_tb_roles.updatedAt, sort: true }],
    ]);

  protected declarationSearch = (): SearchConditionMap =>
    new Map([
      [
        "code",
        (text: string) =>
          text ? ilike(base_tb_roles.code, `%${text}%`) : undefined,
      ],
      [
        "name",
        (text: string) =>
          text
            ? sql`LOWER(${base_tb_roles.name}::text) LIKE ${`%${text.toLowerCase()}%`}`
            : undefined,
      ],
    ]);

  protected declarationFilter = (): FilterConditionMap<ParamFilter> =>
    new Map([
      [
        "isActive",
        (value?: unknown) =>
          typeof value === "boolean"
            ? eq(base_tb_roles.isActive, value)
            : undefined,
      ],
      [
        "isSystem",
        (value?: unknown) =>
          typeof value === "boolean"
            ? eq(base_tb_roles.isSystem, value)
            : undefined,
      ],
    ]);

  protected declarationMappingData = (row: any): RoleRow => ({
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description ?? undefined,
    permissions: [],
    isSystem: row.isSystem ?? undefined,
    isActive: row.isActive ?? undefined,
    createdAt: row.createdAt?.getTime(),
    updatedAt: row.updatedAt?.getTime(),
  });

  @PermissionRequired({ auth: true, permissions: ["base.role.view"] })
  getData = async (
    params: ListParamsRequest,
  ): Promise<ListParamsResponse<RoleRow>> => this.buildQueryDataList(params);
}

export default RoleViewListModel;
