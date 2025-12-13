import { BaseModel } from "@base/server/models/BaseModel";
import { and, eq } from "drizzle-orm";
import { base_tb_role_permissions } from "../../schemas";

export interface RolePermissionRow {
  id: string;
  roleId: string;
  permissionKey: string;
  permissionId?: string | null;
  isActive: boolean;
  createdAt?: number;
  createdBy?: string;
}

export default class RolePermissionModel extends BaseModel<
  typeof base_tb_role_permissions
> {
  constructor() {
    super(base_tb_role_permissions);
  }

  /**
   * Get all permissions for a role
   */
  async getPermissionsByRole(roleId: string): Promise<string[]> {
    const results = await this.db
      .select({
        permissionKey: this.table.permissionKey,
      })
      .from(this.table)
      .where(and(eq(this.table.roleId, roleId), eq(this.table.isActive, true)));

    return results.map((r) => r.permissionKey);
  }

  /**
   * Get permissions for multiple roles
   */
  async getPermissionsByRoles(
    roleIds: string[]
  ): Promise<Map<string, string[]>> {
    if (roleIds.length === 0) {
      return new Map();
    }

    const results = await this.db
      .select({
        roleId: this.table.roleId,
        permissionKey: this.table.permissionKey,
      })
      .from(this.table)
      .where(and(eq(this.table.isActive, true)));

    const permissionsMap = new Map<string, string[]>();

    for (const roleId of roleIds) {
      permissionsMap.set(roleId, []);
    }

    for (const result of results) {
      if (roleIds.includes(result.roleId)) {
        const existing = permissionsMap.get(result.roleId) || [];
        existing.push(result.permissionKey);
        permissionsMap.set(result.roleId, existing);
      }
    }

    return permissionsMap;
  }

  /**
   * Add permission to role
   */
  async addPermissionToRole(
    roleId: string,
    permissionKey: string,
    permissionId?: string | null,
    createdBy?: string
  ): Promise<RolePermissionRow> {
    const now = new Date();

    // Check if already exists
    const existing = await this.db
      .select()
      .from(this.table)
      .where(
        and(
          eq(this.table.roleId, roleId),
          eq(this.table.permissionKey, permissionKey)
        )
      )
      .limit(1);

    if (existing[0]) {
      // Reactivate if inactive
      if (!existing[0].isActive) {
        await this.db
          .update(this.table)
          .set({
            isActive: true,
            permissionId: permissionId ?? null,
          })
          .where(eq(this.table.id, existing[0].id));
      }

      return {
        id: existing[0].id,
        roleId: existing[0].roleId,
        permissionKey: existing[0].permissionKey,
        permissionId: permissionId ?? existing[0].permissionId ?? undefined,
        isActive: true,
        createdAt: existing[0].createdAt?.getTime(),
        createdBy: existing[0].createdBy ?? undefined,
      };
    }

    const [created] = await this.db
      .insert(this.table)
      .values({
        roleId,
        permissionKey,
        permissionId: permissionId ?? null,
        isActive: true,
        createdAt: now,
        createdBy: createdBy ?? null,
      })
      .returning();

    if (!created) {
      throw new Error("Failed to add permission to role");
    }

    return {
      id: created.id,
      roleId: created.roleId,
      permissionKey: created.permissionKey,
      permissionId: created.permissionId ?? undefined,
      isActive: created.isActive,
      createdAt: created.createdAt?.getTime(),
      createdBy: created.createdBy ?? undefined,
    };
  }

  /**
   * Remove permission from role (soft delete)
   */
  async removePermissionFromRole(
    roleId: string,
    permissionKey: string
  ): Promise<boolean> {
    const result = await this.db
      .update(this.table)
      .set({
        isActive: false,
      })
      .where(
        and(
          eq(this.table.roleId, roleId),
          eq(this.table.permissionKey, permissionKey),
          eq(this.table.isActive, true)
        )
      )
      .returning();

    return result.length > 0;
  }

  /**
   * Set permissions for role (replace all)
   */
  async setPermissionsForRole(
    roleId: string,
    permissionKeys: string[],
    createdBy?: string
  ): Promise<void> {
    // Get current permissions
    const current = await this.getPermissionsByRole(roleId);
    const currentSet = new Set(current);

    // Deactivate permissions not in new list
    for (const key of current) {
      if (!permissionKeys.includes(key)) {
        await this.removePermissionFromRole(roleId, key);
      }
    }

    // Add new permissions
    for (const key of permissionKeys) {
      if (!currentSet.has(key)) {
        await this.addPermissionToRole(roleId, key, null, createdBy);
      }
    }
  }

  /**
   * Standard CRUD method
   */
  getDataById = async (params: { id: string }) => {
    const result = await this.db
      .select()
      .from(this.table)
      .where(eq(this.table.id, params.id))
      .limit(1);
    return result[0] || null;
  };
}
