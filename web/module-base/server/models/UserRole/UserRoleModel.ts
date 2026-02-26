import type { NextRequest } from "next/server";

import { and, eq, inArray } from "drizzle-orm";

import { BaseModel } from "@base/server/models/BaseModel";

import { JSON_RPC_ERROR_CODES, JsonRpcError } from "../../rpc/jsonRpcHandler";
import {
  base_tb_permissions,
  base_tb_role_permissions_default,
  base_tb_roles,
  base_tb_user_roles,
} from "../../schemas";
import UserPermissionModel from "../UserPermission/UserPermissionModel";

export interface UserRoleRow {
  id: string;
  userId: string;
  roleId: string;
  isActive: boolean;
  createdAt?: number;
  createdBy?: string;
}

export default class UserRoleModel extends BaseModel<
  typeof base_tb_user_roles
> {
  constructor() {
    super(base_tb_user_roles);
  }

  /**
   * Get user's permissions (aggregate từ tất cả roles)
   */
  async getUserPermissions(userId: string): Promise<Set<string>> {
    // Get user's roles
    const userRoles = await this.db
      .select({
        roleId: base_tb_roles.id,
      })
      .from(this.table)
      .innerJoin(base_tb_roles, eq(this.table.roleId, base_tb_roles.id))
      .where(
        and(
          eq(this.table.userId, userId),
          eq(this.table.isActive, true),
          eq(base_tb_roles.isActive, true),
        ),
      );

    const roleIds = userRoles.map((r) => r.roleId);
    const permissionsSet = new Set<string>();

    if (roleIds.length > 0) {
      // Get permissions from role_permissions_default
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
        permissionsSet.add(rp.permissionKey);
      }
    }

    return permissionsSet;
  }

  /**
   * RPC: Get roles for a user (with role id, code, name).
   * Current user can get own roles; only admin/system can get another user's roles.
   */
  async getRolesForUser(
    params: { userId: string },
    request?: NextRequest,
  ): Promise<{ id: string; roleId: string; code: string; name: unknown }[]> {
    const currentUserId = request?.headers.get("x-user-id") ?? null;

    if (!currentUserId) {
      throw new JsonRpcError(
        JSON_RPC_ERROR_CODES.AUTHENTICATION_ERROR,
        "Authentication required",
      );
    }
    if (params.userId !== currentUserId) {
      const permModel = new UserPermissionModel();
      const result = await permModel.getPermissionsByUser(currentUserId);

      if (!result.isGlobalAdmin) {
        throw new JsonRpcError(
          JSON_RPC_ERROR_CODES.AUTHORIZATION_ERROR,
          "Only admin or system admin can view or change another user's permissions",
        );
      }
    }
    const rows = await this.getUserRoles(params.userId);

    if (rows.length === 0) return [];
    const roleIds = Array.from(new Set(rows.map((r) => r.roleId)));
    const roleRows = await this.db
      .select({
        id: base_tb_roles.id,
        code: base_tb_roles.code,
        name: base_tb_roles.name,
      })
      .from(base_tb_roles)
      .where(inArray(base_tb_roles.id, roleIds));
    const roleMap = new Map(roleRows.map((r) => [r.id, r]));

    return rows.map((r) => {
      const role = roleMap.get(r.roleId);

      return {
        id: r.id,
        roleId: r.roleId,
        code: role?.code ?? "",
        name: role?.name ?? null,
      };
    });
  }

  /**
   * Get user's roles
   */
  async getUserRoles(userId: string): Promise<UserRoleRow[]> {
    const conditions = [
      eq(this.table.userId, userId),
      eq(this.table.isActive, true),
    ];

    const results = await this.db
      .select({
        userRole: this.table,
        role: base_tb_roles,
      })
      .from(this.table)
      .innerJoin(base_tb_roles, eq(this.table.roleId, base_tb_roles.id))
      .where(and(...conditions));

    return results.map((r) => ({
      id: r.userRole.id,
      userId: r.userRole.userId,
      roleId: r.userRole.roleId,
      isActive: r.userRole.isActive,
      createdAt: r.userRole.createdAt?.getTime(),
      createdBy: r.userRole.createdBy ?? undefined,
    }));
  }

  /**
   * Invalidate permissions cache cho user
   */
  private async invalidateUserPermissionsCache(userId: string): Promise<void> {
    const userPermissionModel = new UserPermissionModel();

    await userPermissionModel.invalidateCache(userId);
  }

  /**
   * Assign role to user
   */
  async assignRole(
    userId: string,
    roleId: string,
    createdBy?: string,
  ): Promise<UserRoleRow> {
    const now = new Date();

    // Check if already assigned
    const existing = await this.db
      .select()
      .from(this.table)
      .where(and(eq(this.table.userId, userId), eq(this.table.roleId, roleId)))
      .limit(1);

    if (existing[0]) {
      // Reactivate if inactive
      await this.db
        .update(this.table)
        .set({
          isActive: true,
          createdBy: createdBy ?? null,
        })
        .where(eq(this.table.id, existing[0].id));

      // Invalidate cache permissions của user
      await this.invalidateUserPermissionsCache(userId);

      return {
        id: existing[0].id,
        userId: existing[0].userId,
        roleId: existing[0].roleId,
        isActive: true,
        createdAt: now.getTime(),
        createdBy: createdBy ?? undefined,
      };
    }

    const [created] = await this.db
      .insert(this.table)
      .values({
        userId,
        roleId,
        isActive: true,
        createdAt: now,
        createdBy: createdBy ?? null,
      })
      .returning();

    if (!created) {
      throw new Error("Failed to assign role");
    }

    // Invalidate cache permissions của user
    await this.invalidateUserPermissionsCache(userId);

    return {
      id: created.id,
      userId: created.userId,
      roleId: created.roleId,
      isActive: created.isActive,
      createdAt: created.createdAt?.getTime(),
      createdBy: created.createdBy ?? undefined,
    };
  }

  /**
   * RPC: Assign role to user. Only admin/system admin can change another user's roles.
   */
  async assignRoleToUser(
    params: { userId: string; roleId: string; createdBy?: string },
    request?: NextRequest,
  ): Promise<UserRoleRow> {
    const currentUserId = request?.headers.get("x-user-id") ?? null;

    if (!currentUserId) {
      throw new JsonRpcError(
        JSON_RPC_ERROR_CODES.AUTHENTICATION_ERROR,
        "Authentication required",
      );
    }
    const permModel = new UserPermissionModel();
    const result = await permModel.getPermissionsByUser(currentUserId);

    if (!result.isGlobalAdmin) {
      throw new JsonRpcError(
        JSON_RPC_ERROR_CODES.AUTHORIZATION_ERROR,
        "Only admin or system admin can change user permissions",
      );
    }

    return this.assignRole(
      params.userId,
      params.roleId,
      params.createdBy ?? currentUserId,
    );
  }

  /**
   * RPC: Revoke role from user. Only admin/system admin can change another user's roles.
   */
  async revokeRoleFromUser(
    params: { userId: string; roleId: string },
    request?: NextRequest,
  ): Promise<boolean> {
    const currentUserId = request?.headers.get("x-user-id") ?? null;

    if (!currentUserId) {
      throw new JsonRpcError(
        JSON_RPC_ERROR_CODES.AUTHENTICATION_ERROR,
        "Authentication required",
      );
    }
    const permModel = new UserPermissionModel();
    const result = await permModel.getPermissionsByUser(currentUserId);

    if (!result.isGlobalAdmin) {
      throw new JsonRpcError(
        JSON_RPC_ERROR_CODES.AUTHORIZATION_ERROR,
        "Only admin or system admin can change user permissions",
      );
    }

    return this.revokeRole(params.userId, params.roleId);
  }

  /**
   * Revoke role from user (soft delete)
   */
  async revokeRole(userId: string, roleId: string): Promise<boolean> {
    const result = await this.db
      .update(this.table)
      .set({
        isActive: false,
      })
      .where(
        and(
          eq(this.table.userId, userId),
          eq(this.table.roleId, roleId),
          eq(this.table.isActive, true),
        ),
      )
      .returning();

    const success = result.length > 0;

    // Invalidate cache nếu thành công
    if (success) {
      await this.invalidateUserPermissionsCache(userId);
    }

    return success;
  }

  /**
   * Lấy tất cả user IDs có role này (để invalidate cache khi role thay đổi)
   */
  async getUserIdsByRole(roleId: string): Promise<string[]> {
    const results = await this.db
      .select({
        userId: this.table.userId,
      })
      .from(this.table)
      .where(and(eq(this.table.roleId, roleId), eq(this.table.isActive, true)));

    // Remove duplicates
    return Array.from(new Set(results.map((r) => r.userId)));
  }

  /**
   * Lấy tất cả user IDs có một trong các roles
   */
  async getUserIdsByRoles(roleIds: string[]): Promise<string[]> {
    if (roleIds.length === 0) {
      return [];
    }

    const results = await this.db
      .select({
        userId: this.table.userId,
      })
      .from(this.table)
      .where(
        and(inArray(this.table.roleId, roleIds), eq(this.table.isActive, true)),
      );

    // Remove duplicates
    return Array.from(new Set(results.map((r) => r.userId)));
  }

  /**
   * Check if user has specific permission
   */
  async hasPermission(userId: string, permission: string): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);

    return permissions.has(permission);
  }

  /**
   * Check if user has any of the specified permissions
   */
  async hasAnyPermission(
    userId: string,
    permissions: string[],
  ): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);

    return permissions.some((perm) => userPermissions.has(perm));
  }

  /**
   * Check if user has all of the specified permissions
   */
  async hasAllPermissions(
    userId: string,
    permissions: string[],
  ): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);

    return permissions.every((perm) => userPermissions.has(perm));
  }
}
