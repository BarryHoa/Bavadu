import { BaseModel } from "@base/server/models/BaseModel";
import { and, eq, inArray } from "drizzle-orm";

import {
  base_tb_permissions,
  base_tb_role_permissions_default,
  base_tb_roles,
  base_tb_user_permissions,
  base_tb_user_roles,
} from "../../schemas";

export interface UserPermissionResult {
  permissions: Set<string>;
  roles: Array<{
    id: string;
    code: string;
    name: unknown;
  }>;
}

export default class UserPermissionModel extends BaseModel<
  typeof base_tb_user_permissions
> {
  constructor() {
    super(base_tb_user_permissions);
  }

  /**
   * Standard CRUD method - Get by ID
   */
  getDataById = async (params: { id: string }) => {
    const result = await this.db
      .select()
      .from(this.table)
      .where(eq(this.table.id, params.id))
      .limit(1);

    return result[0] || null;
  };

  /**
   * Get user's final permissions (role permissions + overrides)
   * Logic:
   * 1. Get all permissions from user's roles
   * 2. Apply granted permissions from overrides
   * 3. Remove revoked permissions from overrides
   */
  async getPermissionsByUser(userId: string): Promise<UserPermissionResult> {
    // 1. Get user's roles
    const userRoles = await this.db
      .select({
        role: {
          id: base_tb_roles.id,
          code: base_tb_roles.code,
          name: base_tb_roles.name,
        },
      })
      .from(base_tb_user_roles)
      .innerJoin(base_tb_roles, eq(base_tb_user_roles.roleId, base_tb_roles.id))
      .where(
        and(
          eq(base_tb_user_roles.userId, userId),
          eq(base_tb_user_roles.isActive, true),
          eq(base_tb_roles.isActive, true),
        ),
      );

    const roles = userRoles.map((r) => ({
      id: r.role.id,
      code: r.role.code,
      name: r.role.name,
    }));

    // 2. Get permissions from role_permissions_default table for all user's roles
    const rolePermissions = new Set<string>();
    const roleIds = roles.map((r) => r.id);

    if (roleIds.length > 0) {
      const rolePerms = await this.db
        .select({
          permissionKey: base_tb_permissions.key,
        })
        .from(base_tb_role_permissions_default)
        .innerJoin(
          base_tb_permissions,
          eq(
            base_tb_role_permissions_default.permissionId,
            base_tb_permissions.id,
          ),
        )
        .where(
          and(
            inArray(base_tb_role_permissions_default.roleId, roleIds),
            eq(base_tb_role_permissions_default.isActive, true),
            eq(base_tb_permissions.isActive, true),
          ),
        );

      for (const rp of rolePerms) {
        rolePermissions.add(rp.permissionKey);
      }
    }

    // 3. Get additional user permissions (from user_permissions table)
    const userPerms = await this.db
      .select({
        permissionKey: base_tb_permissions.key,
      })
      .from(base_tb_user_permissions)
      .innerJoin(
        base_tb_permissions,
        eq(base_tb_user_permissions.permissionId, base_tb_permissions.id),
      )
      .where(
        and(
          eq(base_tb_user_permissions.userId, userId),
          eq(base_tb_user_permissions.isActive, true),
          eq(base_tb_permissions.isActive, true),
        ),
      );

    // 4. Combine role permissions and user permissions
    const finalPermissions = new Set(rolePermissions);

    for (const up of userPerms) {
      finalPermissions.add(up.permissionKey);
    }

    return {
      permissions: finalPermissions,
      roles,
    };
  }

  /**
   * Get user's permissions as array (for API responses)
   */
  async getPermissionsByUserArray(userId: string): Promise<string[]> {
    const result = await this.getPermissionsByUser(userId);

    return Array.from(result.permissions).sort();
  }

  /**
   * Check if user has specific permission
   */
  async hasPermission(userId: string, permission: string): Promise<boolean> {
    const result = await this.getPermissionsByUser(userId);

    return result.permissions.has(permission);
  }

  /**
   * Check if user has any of the specified permissions
   */
  async hasAnyPermission(
    userId: string,
    permissions: string[],
  ): Promise<boolean> {
    const result = await this.getPermissionsByUser(userId);

    return permissions.some((perm) => result.permissions.has(perm));
  }

  /**
   * Check if user has all of the specified permissions
   */
  async hasAllPermissions(
    userId: string,
    permissions: string[],
  ): Promise<boolean> {
    const result = await this.getPermissionsByUser(userId);

    return permissions.every((perm) => result.permissions.has(perm));
  }

  /**
   * Add permission to user
   */
  async addPermissionToUser(
    userId: string,
    permissionId: string,
    createdBy?: string,
  ) {
    const now = new Date();

    // Check if already exists
    const existing = await this.db
      .select()
      .from(this.table)
      .where(
        and(
          eq(this.table.userId, userId),
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

      return existing[0];
    }

    // Create new user permission
    const [created] = await this.db
      .insert(this.table)
      .values({
        userId,
        permissionId,
        isActive: true,
        createdAt: now,
        createdBy: createdBy ?? null,
      })
      .returning();

    return created;
  }

  /**
   * Remove permission from user (soft delete)
   */
  async removePermissionFromUser(userId: string, permissionId: string) {
    const result = await this.db
      .update(this.table)
      .set({
        isActive: false,
      })
      .where(
        and(
          eq(this.table.userId, userId),
          eq(this.table.permissionId, permissionId),
          eq(this.table.isActive, true),
        ),
      )
      .returning();

    return result.length > 0;
  }
}
