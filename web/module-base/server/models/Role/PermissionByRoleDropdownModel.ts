import { and, asc, eq } from "drizzle-orm";

import { BaseModel } from "@base/server/models/BaseModel";

import {
  base_tb_permissions,
  base_tb_role_permissions_default,
} from "../../schemas";

import type { PermissionDropdownOption } from "./PermissionDropdownListModel";

class PermissionByRoleDropdownModel extends BaseModel<
  typeof base_tb_permissions
> {
  constructor() {
    super(base_tb_permissions);
  }

  /**
   * Get all permissions belonging to a specific role, formatted for dropdowns.
   */
  async getDataByRole(params: {
    roleId: string;
  }): Promise<PermissionDropdownOption[]> {
    const { roleId } = params;

    const rows = await this.db
      .select({
        id: base_tb_permissions.id,
        key: base_tb_permissions.key,
        module: base_tb_permissions.module,
        resource: base_tb_permissions.resource,
        action: base_tb_permissions.action,
        name: base_tb_permissions.name,
      })
      .from(base_tb_permissions)
      .innerJoin(
        base_tb_role_permissions_default,
        and(
          eq(
            base_tb_role_permissions_default.permissionId,
            base_tb_permissions.id,
          ),
          eq(base_tb_role_permissions_default.roleId, roleId),
          eq(base_tb_role_permissions_default.isActive, true),
        ),
      )
      .where(eq(base_tb_permissions.isActive, true))
      .orderBy(
        asc(base_tb_permissions.module),
        asc(base_tb_permissions.resource),
        asc(base_tb_permissions.action),
      );

    return rows.map((row) => {
      return {
        label: row.name,
        value: row.id,
        key: row.key,
        module: row.module,
        resource: row.resource,
        action: row.action,
      };
    });
  }
}

export default PermissionByRoleDropdownModel;
