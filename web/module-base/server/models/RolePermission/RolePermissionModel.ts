import { and, eq, inArray } from "drizzle-orm";

import { BaseModel } from "@base/server/models/BaseModel";

import UserRoleModel from "../UserRole/UserRoleModel";
import UserPermissionModel from "../UserPermission/UserPermissionModel";
import {
  base_tb_permissions,
  base_tb_role_permissions_default,
} from "../../schemas";

export interface RolePermissionRow {
  id: string;
  roleId: string;
  permissionId: string;
  permissionKey: string;
  isActive: boolean;
  createdAt?: number;
  createdBy?: string;
}

export default class RolePermissionModel extends BaseModel<
  typeof base_tb_role_permissions_default
> {
  constructor() {
    super(base_tb_role_permissions_default);
  }

  /**
   * Invalidate cache permissions của tất cả users có role này
   */
  private async invalidateRoleUsersCache(roleId: string): Promise<void> {
    const userRoleModel = new UserRoleModel();
    const userIds = await userRoleModel.getUserIdsByRole(roleId);

    if (userIds.length > 0) {
      const userPermissionModel = new UserPermissionModel();

      await userPermissionModel.invalidateCacheMany(userIds);
    }
  }

  /**
   * Get all permissions for a role
   */
  async getPermissionsByRole(roleId: string): Promise<string[]> {
    const results = await this.db
      .select({
        permissionKey: base_tb_permissions.key,
      })
      .from(this.table)
      .innerJoin(
        base_tb_permissions,
        eq(this.table.permissionId, base_tb_permissions.id),
      )
      .where(
        and(
          eq(this.table.roleId, roleId),
          eq(this.table.isActive, true),
          eq(base_tb_permissions.isActive, true),
        ),
      );

    return results.map((r) => r.permissionKey);
  }

  /**
   * Get permissions for multiple roles
   */
  async getPermissionsByRoles(
    roleIds: string[],
  ): Promise<Map<string, string[]>> {
    if (roleIds.length === 0) {
      return new Map();
    }

    const results = await this.db
      .select({
        roleId: this.table.roleId,
        permissionKey: base_tb_permissions.key,
      })
      .from(this.table)
      .innerJoin(
        base_tb_permissions,
        eq(this.table.permissionId, base_tb_permissions.id),
      )
      .where(
        and(
          inArray(this.table.roleId, roleIds),
          eq(this.table.isActive, true),
          eq(base_tb_permissions.isActive, true),
        ),
      );

    const permissionsMap = new Map<string, string[]>();

    for (const roleId of roleIds) {
      permissionsMap.set(roleId, []);
    }

    for (const result of results) {
      const existing = permissionsMap.get(result.roleId) || [];

      existing.push(result.permissionKey);
      permissionsMap.set(result.roleId, existing);
    }

    return permissionsMap;
  }

  /**
   * Add permission to role
   */
  async addPermissionToRole(
    roleId: string,
    permissionId: string,
    createdBy?: string,
  ): Promise<RolePermissionRow> {
    const now = new Date();

    // Get permission key for return value
    const permission = await this.db
      .select({ key: base_tb_permissions.key })
      .from(base_tb_permissions)
      .where(eq(base_tb_permissions.id, permissionId))
      .limit(1);

    if (!permission[0]) {
      throw new Error("Permission not found");
    }

    // Check if already exists
    const existing = await this.db
      .select()
      .from(this.table)
      .where(
        and(
          eq(this.table.roleId, roleId),
          eq(this.table.permissionId, permissionId),
        ),
      )
      .limit(1);

    if (existing[0]) {
      // Reactivate if inactive
      if (!existing[0].isActive) {
        await this.db
          .update(this.table)
          .set({
            isActive: true,
          })
          .where(eq(this.table.id, existing[0].id));
      }

      // Invalidate cache
      await this.invalidateRoleUsersCache(roleId);

      return {
        id: existing[0].id,
        roleId: existing[0].roleId,
        permissionId: existing[0].permissionId,
        permissionKey: permission[0].key,
        isActive: true,
        createdAt: existing[0].createdAt?.getTime(),
        createdBy: existing[0].createdBy ?? undefined,
      };
    }

    const [created] = await this.db
      .insert(this.table)
      .values({
        roleId,
        permissionId,
        isActive: true,
        createdAt: now,
        createdBy: createdBy ?? null,
      })
      .returning();

    if (!created) {
      throw new Error("Failed to add permission to role");
    }

    // Invalidate cache
    await this.invalidateRoleUsersCache(roleId);

    return {
      id: created.id,
      roleId: created.roleId,
      permissionId: created.permissionId,
      permissionKey: permission[0].key,
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
    permissionId: string,
  ): Promise<boolean> {
    const result = await this.db
      .update(this.table)
      .set({
        isActive: false,
      })
      .where(
        and(
          eq(this.table.roleId, roleId),
          eq(this.table.permissionId, permissionId),
          eq(this.table.isActive, true),
        ),
      )
      .returning();

    const success = result.length > 0;

    // Invalidate cache nếu thành công
    if (success) {
      await this.invalidateRoleUsersCache(roleId);
    }

    return success;
  }

  /**
   * Set permissions for role (replace all)
   */
  async setPermissionsForRole(
    roleId: string,
    permissionIds: string[],
    createdBy?: string,
  ): Promise<void> {
    // Get current permissions
    const current = await this.db
      .select({
        permissionId: this.table.permissionId,
      })
      .from(this.table)
      .where(and(eq(this.table.roleId, roleId), eq(this.table.isActive, true)));

    const currentSet = new Set(current.map((c) => c.permissionId));
    const newSet = new Set(permissionIds);

    // Deactivate permissions not in new list
    for (const perm of current) {
      if (!newSet.has(perm.permissionId)) {
        await this.removePermissionFromRole(roleId, perm.permissionId);
      }
    }

    // Add new permissions
    for (const permissionId of permissionIds) {
      if (!currentSet.has(permissionId)) {
        await this.addPermissionToRole(roleId, permissionId, createdBy);
      }
    }

    // Invalidate cache sau khi set permissions (đảm bảo cache được clear)
    await this.invalidateRoleUsersCache(roleId);
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
