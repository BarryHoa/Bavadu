import { BaseModel } from "@base/server/models/BaseModel";
import { and, eq, inArray, isNull } from "drizzle-orm";
import {
  base_tb_role_permissions,
  base_tb_roles,
  base_tb_user_permission_overrides,
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
  typeof base_tb_user_permission_overrides
> {
  constructor() {
    super(base_tb_user_permission_overrides);
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
          eq(base_tb_roles.isActive, true)
        )
      );

    const roles = userRoles.map((r) => ({
      id: r.role.id,
      code: r.role.code,
      name: r.role.name,
    }));

    // 2. Get permissions from role_permissions table for all user's roles
    const rolePermissions = new Set<string>();
    const roleIds = roles.map((r) => r.id);

    if (roleIds.length > 0) {
      const rolePerms = await this.db
        .select({
          permissionKey: base_tb_role_permissions.permissionKey,
        })
        .from(base_tb_role_permissions)
        .where(
          and(
            inArray(base_tb_role_permissions.roleId, roleIds),
            eq(base_tb_role_permissions.isActive, true)
          )
        );

      for (const rp of rolePerms) {
        rolePermissions.add(rp.permissionKey);
      }

      // Fallback: Also check roles.permissions (jsonb) for backward compatibility
      // This can be removed after full migration to role_permissions table
      const rolesWithJsonbPerms = await this.db
        .select({
          permissions: base_tb_roles.permissions,
        })
        .from(base_tb_roles)
        .where(inArray(base_tb_roles.id, roleIds));

      for (const role of rolesWithJsonbPerms) {
        if (role.permissions && Array.isArray(role.permissions)) {
          (role.permissions as string[]).forEach((perm) => {
            rolePermissions.add(perm);
          });
        }
      }
    }

    // 3. Get permission overrides for this user
    const overrides = await this.db
      .select()
      .from(this.table)
      .where(and(eq(this.table.userId, userId), eq(this.table.isActive, true)));

    // 4. Apply overrides: add granted, remove revoked
    const finalPermissions = new Set(rolePermissions);

    for (const override of overrides) {
      // Add granted permissions
      if (
        override.grantedPermissions &&
        Array.isArray(override.grantedPermissions)
      ) {
        (override.grantedPermissions as string[]).forEach((perm) => {
          finalPermissions.add(perm);
        });
      }

      // Remove revoked permissions (takes precedence)
      if (
        override.revokedPermissions &&
        Array.isArray(override.revokedPermissions)
      ) {
        (override.revokedPermissions as string[]).forEach((perm) => {
          finalPermissions.delete(perm);
        });
      }
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
    permissions: string[]
  ): Promise<boolean> {
    const result = await this.getPermissionsByUser(userId);
    return permissions.some((perm) => result.permissions.has(perm));
  }

  /**
   * Check if user has all of the specified permissions
   */
  async hasAllPermissions(
    userId: string,
    permissions: string[]
  ): Promise<boolean> {
    const result = await this.getPermissionsByUser(userId);
    return permissions.every((perm) => result.permissions.has(perm));
  }

  /**
   * Set permission override for user
   */
  async setPermissionOverride(
    userId: string,
    payload: {
      grantedPermissions?: string[];
      revokedPermissions?: string[];
      module?: string | null;
    }
  ) {
    const now = new Date();

    // Check if override exists
    const conditions = [eq(this.table.userId, userId)];
    if (payload.module !== undefined) {
      if (payload.module === null) {
        conditions.push(isNull(this.table.module));
      } else {
        conditions.push(eq(this.table.module, payload.module));
      }
    } else {
      conditions.push(isNull(this.table.module));
    }

    const existing = await this.db
      .select()
      .from(this.table)
      .where(and(...conditions))
      .limit(1);

    if (existing[0]) {
      // Update existing override
      await this.db
        .update(this.table)
        .set({
          grantedPermissions: payload.grantedPermissions ?? null,
          revokedPermissions: payload.revokedPermissions ?? null,
          updatedAt: now,
        })
        .where(eq(this.table.id, existing[0].id));
    } else {
      // Create new override
      await this.db.insert(this.table).values({
        userId,
        grantedPermissions: payload.grantedPermissions ?? null,
        revokedPermissions: payload.revokedPermissions ?? null,
        module: payload.module ?? null,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
    }
  }
}
