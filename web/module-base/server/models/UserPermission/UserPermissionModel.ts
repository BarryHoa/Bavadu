import { and, eq, inArray } from "drizzle-orm";

import BaseModelCached from "@base/server/models/BaseModelCached";

import {
  base_tb_permissions,
  base_tb_role_admin_modules,
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
  isGlobalAdmin?: boolean;
  adminModules?: Set<string>;
}

// Interface cho cache data (Set không thể serialize, nên dùng Array)
interface CachedUserPermissionResult {
  permissions: string[]; // Array thay vì Set để có thể serialize
  roles: Array<{
    id: string;
    code: string;
    name: unknown;
  }>;
  cachedAt: number;
  isGlobalAdmin?: boolean;
  adminModules?: string[];
}

export default class UserPermissionModel extends BaseModelCached<
  typeof base_tb_user_permissions,
  CachedUserPermissionResult
> {
  protected cachePrefix = "permissions:";
  private cacheTTL = 1800; // 30 phút

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
   * Với cache support
   * @param userId - User ID
   * @param forceRefresh - Force refresh từ database, bỏ qua cache
   */
  async getPermissionsByUser(
    userId: string,
    forceRefresh = false,
  ): Promise<UserPermissionResult> {
    // Nếu không force refresh, thử lấy từ cache
    if (!forceRefresh) {
      const cached =
        await this.cacheGet<CachedUserPermissionResult>(userId);

      if (cached !== this.CACHE_NOT_FOUND) {
        const data = cached as CachedUserPermissionResult;

        // Convert Array back to Set
        return {
          permissions: new Set(data.permissions),
          roles: data.roles,
          isGlobalAdmin: data.isGlobalAdmin,
          adminModules: data.adminModules
            ? new Set(data.adminModules)
            : undefined,
        };
      }
    }

    // Lấy từ database
    const result = await this._getPermissionsByUserFromDB(userId);

    // Cache lại
    const cacheData: CachedUserPermissionResult = {
      permissions: Array.from(result.permissions), // Convert Set to Array
      roles: result.roles,
      cachedAt: Date.now(),
      isGlobalAdmin: result.isGlobalAdmin,
      adminModules: result.adminModules
        ? Array.from(result.adminModules)
        : undefined,
    };

    await this.cacheSet(cacheData, userId, { ttl: this.cacheTTL });

    return result;
  }

  /**
   * Lấy permissions từ database (private method)
   */
  private async _getPermissionsByUserFromDB(
    userId: string,
  ): Promise<UserPermissionResult> {
    // 1. Get user's roles
    const userRoles = await this.db
      .select({
        role: {
          id: base_tb_roles.id,
          code: base_tb_roles.code,
          name: base_tb_roles.name,
          isSystem: base_tb_roles.isSystem,
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

    const roleIds = roles.map((r) => r.id);
    let isGlobalAdmin = false;
    const adminModules = new Set<string>();

    for (const r of userRoles) {
      const role = r.role as { code: string; isSystem?: boolean | null };

      if (role.code === "system" || role.code === "admin" || role.isSystem) {
        isGlobalAdmin = true;
      }
    }

    // Admin scopes từ bảng role_admin_modules (hierarchical: hrm, hrm.timesheet...)
    if (roleIds.length > 0) {
      const scopeRows = await this.db
        .select({ scope: base_tb_role_admin_modules.scope })
        .from(base_tb_role_admin_modules)
        .where(
          and(
            inArray(base_tb_role_admin_modules.roleId, roleIds),
            eq(base_tb_role_admin_modules.isActive, true),
          ),
        );

      for (const row of scopeRows) {
        adminModules.add(row.scope);
      }
    }

    // 2. Get permissions from role_permissions_default table for all user's roles
    const rolePermissions = new Set<string>();

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
      isGlobalAdmin,
      adminModules,
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
   * Kiểm tra user có đủ một permission theo quy ước:
   * - required (vd: hrm.employee.view) = đúng quyền đó
   * - feature wildcard (vd: hrm.employee.*) = mọi quyền của feature
   * - module wildcard (vd: hrm.*) = mọi quyền của module
   */
  private hasPermissionWithWildcards(
    userPermissions: Set<string>,
    required: string,
  ): boolean {
    if (userPermissions.has(required)) return true;
    const parts = required.split(".");
    if (parts.length >= 2) {
      const moduleWildcard = `${parts[0]}.*`;
      if (userPermissions.has(moduleWildcard)) return true;
    }
    if (parts.length >= 3) {
      const featureWildcard = `${parts[0]}.${parts[1]}.*`;
      if (userPermissions.has(featureWildcard)) return true;
    }
    return false;
  }

  /**
   * Check if user has all of the specified permissions.
   * Supports wildcards: hrm.employee.view is satisfied by hrm.employee.view, hrm.employee.*, or hrm.*.
   */
  async hasAllPermissions(
    userId: string,
    permissions: string[],
  ): Promise<boolean> {
    const result = await this.getPermissionsByUser(userId);

    return permissions.every((perm) =>
      this.hasPermissionWithWildcards(result.permissions, perm),
    );
  }

  /**
   * Add permission to user
   * Xóa cache sau khi thêm
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

      // Invalidate cache
      await this.invalidateCache(userId);

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

    // Invalidate cache
    await this.invalidateCache(userId);

    return created;
  }

  /**
   * Remove permission from user (soft delete)
   * Xóa cache sau khi xóa
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

    const success = result.length > 0;

    // Invalidate cache nếu thành công
    if (success) {
      await this.invalidateCache(userId);
    }

    return success;
  }

  /**
   * Xóa cache permissions của user (khi có thay đổi role/permission)
   */
  async invalidateCache(userId: string): Promise<void> {
    await this.cacheDelete(userId);
  }

  /**
   * Xóa cache permissions của nhiều users
   */
  async invalidateCacheMany(userIds: string[]): Promise<void> {
    if (userIds.length === 0) {
      return;
    }

    await this.cacheDeleteMany(userIds);
  }
}
