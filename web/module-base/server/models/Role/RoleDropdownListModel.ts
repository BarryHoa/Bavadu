import type {
  ListParamsRequest,
  ListParamsResponse,
} from "@base/shared/interface/ListInterface";
import type { Column } from "drizzle-orm";

import { ilike, sql } from "drizzle-orm";

import {
  BaseViewListModel,
  type ColumnMap,
  type SearchConditionMap,
} from "@base/server/models/BaseViewListModel";
import { ParamFilter } from "@base/shared/interface/FilterInterface";

import { base_tb_roles } from "../../schemas/base.role";
import { PermissionRequired } from "../BaseModel";

export type RoleDropdownOption = {
  label: string;
  value: string;
  code: string;
  name: unknown;
  isSystem?: boolean;
  isActive?: boolean;
};

class RoleDropdownListModel extends BaseViewListModel<
  typeof base_tb_roles,
  RoleDropdownOption
> {
  constructor() {
    super({
      table: base_tb_roles,
      sortDefault: [
        { column: "isSystem", direction: "descending" },
        { column: "code", direction: "ascending" },
      ],
    });
  }

  protected declarationColumns = (): ColumnMap =>
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
      ["isSystem", { column: base_tb_roles.isSystem, sort: true }],
      ["isActive", { column: base_tb_roles.isActive, sort: true }],
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

  protected declarationMappingData = (row: any): RoleDropdownOption => {
    const name =
      typeof row.name === "string"
        ? row.name
        : row.name?.vi || row.name?.en || row.code || "";

    return {
      label: `${row.code} - ${name}`,
      value: row.id,
      code: row.code,
      name: row.name,
      isSystem: row.isSystem ?? undefined,
      isActive: row.isActive ?? undefined,
    };
  };

  @PermissionRequired({
    auth: true,
    permissions: ["*"],
  })
  getData = async (
    params: ListParamsRequest<ParamFilter>,
  ): Promise<ListParamsResponse<RoleDropdownOption>> => {
    return this.buildQueryDataList(params);
  };
}

export default RoleDropdownListModel;
