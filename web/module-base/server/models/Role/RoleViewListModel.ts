import {
  BaseViewListModel,
  type FilterConditionMap,
} from "@base/server/models/BaseViewListModel";
import type {
  ListParamsRequest,
  ListParamsResponse,
} from "@base/server/models/interfaces/ListInterface";
import type { Column } from "drizzle-orm";
import { eq, ilike, sql } from "drizzle-orm";
import { base_tb_roles } from "../../schemas/base.role";
import { ParamFilter } from "../interfaces/FilterInterface";
import type { RoleRow } from "./RoleModel";

class RoleViewListModel extends BaseViewListModel<
  typeof base_tb_roles,
  RoleRow
> {
  constructor() {
    super({
      table: base_tb_roles,
      sortDefault: [
        {
          column: "isSystem",
          direction: "descending",
        },
        {
          column: "createdAt",
          direction: "descending",
        },
      ],
    });
  }

  protected declarationColumns = () =>
    new Map<
      string,
      {
        column: Column<any>;
        sort?: boolean;
      }
    >([
      ["id", { column: base_tb_roles.id, sort: false }],
      ["code", { column: base_tb_roles.code, sort: true }],
      ["name", { column: base_tb_roles.name, sort: false }],
      ["description", { column: base_tb_roles.description, sort: false }],
      ["isSystem", { column: base_tb_roles.isSystem, sort: true }],
      ["isActive", { column: base_tb_roles.isActive, sort: true }],
      ["createdAt", { column: base_tb_roles.createdAt, sort: true }],
      ["updatedAt", { column: base_tb_roles.updatedAt, sort: true }],
    ]);

  protected declarationSearch = () =>
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
        (value?: unknown, _filters?: ParamFilter) =>
          typeof value === "boolean"
            ? eq(base_tb_roles.isActive, value)
            : undefined,
      ],
      [
        "isSystem",
        (value?: unknown, _filters?: ParamFilter) =>
          typeof value === "boolean"
            ? eq(base_tb_roles.isSystem, value)
            : undefined,
      ],
    ]);

  protected declarationMappingData = (row: any, index?: number): RoleRow => {
    return {
      id: row.id,
      code: row.code,
      name: row.name,
      description: row.description ?? undefined,
      permissions: [], // Will be loaded separately if needed
      isSystem: row.isSystem ?? undefined,
      isActive: row.isActive ?? undefined,
      createdAt: row.createdAt?.getTime(),
      updatedAt: row.updatedAt?.getTime(),
    };
  };

  getData = async (
    params: ListParamsRequest
  ): Promise<ListParamsResponse<RoleRow>> => {
    return await this.buildQueryDataList(params);
  };
}

export default RoleViewListModel;
