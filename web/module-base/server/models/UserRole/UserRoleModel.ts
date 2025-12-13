import { BaseModel } from "@base/server/models/BaseModel";
import { and, eq } from "drizzle-orm";
import { base_tb_user_roles, base_tb_roles } from "../../schemas";

export interface UserRoleRow {
  id: string;
  userId: string;
  roleId: string;
  scope?: unknown;
  isActive: boolean;
  assignedAt?: number;
  assignedBy?: string;
  revokedAt?: number;
  revokedBy?: string;
}

export default class UserRoleModel extends BaseModel<typeof base_tb_user_roles> {
  constructor() {
    super(base_tb_user_roles);
  }

  /**
   * Get user's permissions (aggregate từ tất cả roles)
   */
  async getUserPermissions(userId: string): Promise<Set<string>> {
    const userRoles = await this.db
      .select({
        permissions: base_tb_roles.permissions,
      })
      .from(this.table)
      .innerJoin(base_tb_roles, eq(this.table.roleId, base_tb_roles.id))
      .where(
        and(
          eq(this.table.userId, userId),
          eq(this.table.isActive, true),
          eq(base_tb_roles.isActive, true)
        )
      );

    const permissionsSet = new Set<string>();

    for (const role of userRoles) {
      if (role.permissions && Array.isArray(role.permissions)) {
        (role.permissions as string[]).forEach((perm) => {
          permissionsSet.add(perm);
        });
      }
    }

    return permissionsSet;
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
      scope: r.userRole.scope ?? undefined,
      isActive: r.userRole.isActive,
      assignedAt: r.userRole.assignedAt?.getTime(),
      assignedBy: r.userRole.assignedBy ?? undefined,
      revokedAt: r.userRole.revokedAt?.getTime(),
      revokedBy: r.userRole.revokedBy ?? undefined,
    }));
  }

  /**
   * Assign role to user
   */
  async assignRole(
    userId: string,
    roleId: string,
    assignedBy?: string,
    scope?: unknown
  ): Promise<UserRoleRow> {
    const now = new Date();

    // Check if already assigned
    const existing = await this.db
      .select()
      .from(this.table)
      .where(
        and(
          eq(this.table.userId, userId),
          eq(this.table.roleId, roleId)
        )
      )
      .limit(1);

    if (existing[0]) {
      // Reactivate if revoked
      await this.db
        .update(this.table)
        .set({
          isActive: true,
          assignedAt: now,
          assignedBy: assignedBy ?? null,
          revokedAt: null,
          revokedBy: null,
          scope: scope ?? null,
        })
        .where(eq(this.table.id, existing[0].id));

      return {
        id: existing[0].id,
        userId: existing[0].userId,
        roleId: existing[0].roleId,
        scope: scope ?? undefined,
        isActive: true,
        assignedAt: now.getTime(),
        assignedBy: assignedBy ?? undefined,
      };
    }

    const [created] = await this.db
      .insert(this.table)
      .values({
        userId,
        roleId,
        scope: scope ?? null,
        isActive: true,
        assignedAt: now,
        assignedBy: assignedBy ?? null,
      })
      .returning();

    if (!created) {
      throw new Error("Failed to assign role");
    }

    return {
      id: created.id,
      userId: created.userId,
      roleId: created.roleId,
      scope: created.scope ?? undefined,
      isActive: created.isActive,
      assignedAt: created.assignedAt?.getTime(),
      assignedBy: created.assignedBy ?? undefined,
    };
  }

  /**
   * Revoke role from user
   */
  async revokeRole(userId: string, roleId: string, revokedBy?: string): Promise<boolean> {
    const now = new Date();

    const result = await this.db
      .update(this.table)
      .set({
        isActive: false,
        revokedAt: now,
        revokedBy: revokedBy ?? null,
      })
      .where(
        and(
          eq(this.table.userId, userId),
          eq(this.table.roleId, roleId),
          eq(this.table.isActive, true)
        )
      )
      .returning();

    return result.length > 0;
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
  async hasAnyPermission(userId: string, permissions: string[]): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    return permissions.some((perm) => userPermissions.has(perm));
  }

  /**
   * Check if user has all of the specified permissions
   */
  async hasAllPermissions(userId: string, permissions: string[]): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    return permissions.every((perm) => userPermissions.has(perm));
  }
}

