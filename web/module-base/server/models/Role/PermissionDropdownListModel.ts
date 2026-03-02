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

import { base_tb_permissions } from "../../schemas";
import { PermissionRequired } from "../BaseModel";

export type PermissionDropdownOption = {
  label: unknown;
  value: string;
  key: string;
  module: string;
  resource: string;
  action: string;
};

class PermissionDropdownListModel extends BaseViewListModel<
  typeof base_tb_permissions,
  PermissionDropdownOption
> {
  constructor() {
    super({
      table: base_tb_permissions,
      sortDefault: [
        { column: "module", direction: "ascending" },
        { column: "resource", direction: "ascending" },
        { column: "action", direction: "ascending" },
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
      ["id", { column: base_tb_permissions.id, sort: false }],
      ["key", { column: base_tb_permissions.key, sort: true }],
      ["module", { column: base_tb_permissions.module, sort: true }],
      ["resource", { column: base_tb_permissions.resource, sort: true }],
      ["action", { column: base_tb_permissions.action, sort: true }],
      ["label", { column: base_tb_permissions.name, sort: false }],
    ]);

  protected declarationSearch = (): SearchConditionMap =>
    new Map([
      [
        "key",
        (text: string) =>
          text ? ilike(base_tb_permissions.key, `%${text}%`) : undefined,
      ],
      [
        "label",
        (text: string) =>
          text
            ? sql`LOWER(${base_tb_permissions.name}::text) LIKE ${`%${text.toLowerCase()}%`}`
            : undefined,
      ],
      [
        "action",
        (text: string) =>
          text
            ? sql`LOWER(${base_tb_permissions.action}::text) LIKE ${`%${text.toLowerCase()}%`}`
            : undefined,
      ],
      [
        "resource",
        (text: string) =>
          text
            ? sql`LOWER(${base_tb_permissions.resource}::text) LIKE ${`%${text.toLowerCase()}%`}`
            : undefined,
      ],
      [
        "module",
        (text: string) =>
          text
            ? sql`LOWER(${base_tb_permissions.module}::text) LIKE ${`%${text.toLowerCase()}%`}`
            : undefined,
      ],
    ]);

  protected declarationMappingData = (row: any): PermissionDropdownOption => {
    return {
      label: row.name,
      value: row.id,
      key: row.key,
      module: row.module,
      resource: row.resource,
      action: row.action,
    };
  };

  /**
   * Get all permissions, formatted for dropdown.
   */
  @PermissionRequired({
    auth: true,
    permissions: ["*"],
  })
  getData = async (
    params: ListParamsRequest<ParamFilter>,
  ): Promise<ListParamsResponse<PermissionDropdownOption>> => {
    return this.buildQueryDataList(params);
  };
}

export default PermissionDropdownListModel;
