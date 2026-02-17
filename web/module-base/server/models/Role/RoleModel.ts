import { and, eq, inArray } from "drizzle-orm";

import { LocaleDataType } from "@base/shared/interface/Locale";
import { BaseModel } from "@base/server/models/BaseModel";

import UserRoleModel from "../UserRole/UserRoleModel";
import UserPermissionModel from "../UserPermission/UserPermissionModel";
import {
  base_tb_permissions,
  base_tb_role_permissions_default,
  base_tb_roles,
  base_tb_user_roles,
} from "../../schemas";

export interface RoleRow {
  id: string;
  code: string;
  name?: unknown;
  description?: unknown;
  permissions?: string[];
  isSystem?: boolean;
  isActive?: boolean;
  createdAt?: number;
  updatedAt?: number;
   // Module-level admin flags loaded from is_admin_modules JSONB
  isAdminModules?: Record<string, boolean>;
}

export interface RoleInput {
  code: string;
  name: LocaleDataType<string>;
  description?: string | null;
  permissions?: string[];
  permissionIds?: string[];
  isSystem?: boolean;
  isActive?: boolean;
  isAdminModules?: Record<string, boolean>;
}

export default class RoleModel extends BaseModel<typeof base_tb_roles> {
  constructor() {
    super(base_tb_roles);
  }

  private normalizeLocaleInput(value: unknown): LocaleDataType<string> | null {
    if (!value) return null;
    if (typeof value === "string") return { en: value };
    if (typeof value === "object") return value as LocaleDataType<string>;

    return null;
  }

  private async invalidateRoleUsersCache(roleId: string): Promise<void> {
    const userRoleModel = new UserRoleModel();
    const userIds = await userRoleModel.getUserIdsByRole(roleId);

    if (userIds.length > 0) {
      const userPermissionModel = new UserPermissionModel();

      await userPermissionModel.invalidateCacheMany(userIds);
    }
  }

  private async mapToRoleRow(
    row: typeof base_tb_roles.$inferSelect,
    dbOrTx?: typeof this.db,
  ): Promise<RoleRow> {
    const db = dbOrTx ?? this.db;
    const permissions = await db
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
          eq(base_tb_role_permissions_default.roleId, row.id),
          eq(base_tb_role_permissions_default.isActive, true),
          eq(base_tb_permissions.isActive, true),
        ),
      );

    return {
      id: row.id,
      code: row.code,
      name: row.name,
      description: row.description ?? undefined,
      permissions: permissions.map((p) => p.permissionKey),
      isSystem: row.isSystem ?? undefined,
      isActive: row.isActive ?? undefined,
      createdAt: row.createdAt?.getTime(),
      updatedAt: row.updatedAt?.getTime(),
      // Drizzle will map JSONB to plain JS object
      isAdminModules: (row as typeof base_tb_roles.$inferSelect & {
        isAdminModules?: Record<string, boolean>;
      }).isAdminModules ?? {},
    };
  }

  /**
   * Get role by ID with full permissions (RPC: base-role.curd.get)
   */
  get = async (params: { id: string }) => {
    const id = params.id;
    const [roleRow] = await this.db
      .select()
      .from(this.table)
      .where(eq(this.table.id, id))
      .limit(1);

    if (!roleRow) return null;

    const permissions = await this.db
      .select({
        id: base_tb_permissions.id,
        key: base_tb_permissions.key,
        module: base_tb_permissions.module,
        resource: base_tb_permissions.resource,
        action: base_tb_permissions.action,
        name: base_tb_permissions.name,
        description: base_tb_permissions.description,
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
          eq(base_tb_role_permissions_default.roleId, id),
          eq(base_tb_role_permissions_default.isActive, true),
        ),
      );

    return {
      id: roleRow.id,
      code: roleRow.code,
      name: roleRow.name,
      description: roleRow.description ?? undefined,
      isSystem: roleRow.isSystem ?? false,
      isActive: roleRow.isActive ?? true,
      createdAt: roleRow.createdAt ? String(roleRow.createdAt.getTime()) : "",
      updatedAt: roleRow.updatedAt
        ? String(roleRow.updatedAt.getTime())
        : undefined,
      isAdminModules: (roleRow as typeof base_tb_roles.$inferSelect & {
        isAdminModules?: Record<string, boolean>;
      }).isAdminModules ?? {},
      permissions: permissions.map((p) => ({
        id: p.id,
        key: p.key,
        module: p.module,
        resource: p.resource,
        action: p.action,
        name: p.name,
        description: p.description,
        isActive: true,
      })),
    };
  };

  /**
   * Create role (RPC: base-role.curd.create)
   */
  create = async (params: {
    code: string;
    name: LocaleDataType<string>;
    description?: string | null;
    permissionIds?: string[];
    isAdminModules?: Record<string, boolean>;
  }): Promise<RoleRow> => {
    const nameNorm = this.normalizeLocaleInput(params.name);

    if (!params.code?.trim()) throw new Error("Code is required");
    if (!nameNorm || (!nameNorm.en && !nameNorm.vi)) throw new Error("Name is required");

    const [existing] = await this.db
      .select()
      .from(this.table)
      .where(eq(this.table.code, params.code.trim()))
      .limit(1);

    if (existing) throw new Error("Role with this code already exists");

    return this.db.transaction(async (tx) => {
      const now = new Date();
      const [created] = await tx
        .insert(this.table)
        .values({
          code: params.code.trim(),
          name: nameNorm,
          description: params.description ?? null,
          isSystem: false,
          isActive: true,
          isAdminModules: params.isAdminModules ?? {},
          createdAt: now,
          updatedAt: now,
        })
        .returning({ id: this.table.id });

      if (!created) throw new Error("Failed to create role");

      const permissionIds = Array.isArray(params.permissionIds)
        ? params.permissionIds
        : [];

      if (permissionIds.length > 0) {
        const validPerms = await tx
          .select({ id: base_tb_permissions.id })
          .from(base_tb_permissions)
          .where(
            and(
              inArray(base_tb_permissions.id, permissionIds),
              eq(base_tb_permissions.isActive, true),
            ),
          );

        if (validPerms.length > 0) {
          await tx.insert(base_tb_role_permissions_default).values(
            validPerms.map((p) => ({
              roleId: created.id,
              permissionId: p.id,
              isActive: true,
              createdAt: now,
            })),
          );
        }
      }

      const [roleRow] = await tx
        .select()
        .from(this.table)
        .where(eq(this.table.id, created.id))
        .limit(1);

      if (!roleRow) throw new Error("Failed to load role after creation");

      return this.mapToRoleRow(roleRow, tx);
    });
  };

  /**
   * Update role (RPC: base-role.curd.update)
   * Accepts { id, payload? } or { id, code?, name?, description?, permissionIds? }
   */
  update = async (params: {
    id: string;
    payload?: Record<string, unknown>;
    code?: string;
    name?: LocaleDataType<string>;
    description?: string | null;
    permissionIds?: string[];
    permissions?: string[];
    isActive?: boolean;
  }): Promise<RoleRow | null> => {
    const id = params.id;
    const payload: Record<string, unknown> =
      params.payload ?? (params as Record<string, unknown>);

    const updateData: Partial<RoleInput> = {};

    if (payload.code !== undefined) updateData.code = String(payload.code);
    if (payload.name !== undefined) {
      updateData.name =
        this.normalizeLocaleInput(payload.name as unknown) ?? undefined;
    }
    if (payload.description !== undefined) {
      updateData.description =
        payload.description !== null && payload.description !== undefined
          ? String(payload.description)
          : null;
    }
    if (payload.permissionIds !== undefined) {
      updateData.permissionIds = Array.isArray(payload.permissionIds)
        ? payload.permissionIds
        : [];
    }
    if (payload.permissions !== undefined) {
      updateData.permissions = Array.isArray(payload.permissions)
        ? payload.permissions
        : [];
    }
    if (payload.isAdminModules !== undefined) {
      updateData.isAdminModules = payload.isAdminModules as Record<
        string,
        boolean
      >;
    }
    if (payload.isActive !== undefined) updateData.isActive = Boolean(payload.isActive);

    const role = await this.db.transaction(async (tx) => {
      const now = new Date();
      const dbUpdate: Partial<typeof this.table.$inferInsert> = {
        updatedAt: now,
      };

      if (updateData.code !== undefined) dbUpdate.code = updateData.code;
      if (updateData.name !== undefined) dbUpdate.name = updateData.name;
      if (updateData.description !== undefined)
        dbUpdate.description = updateData.description ?? null;
      if (updateData.isActive !== undefined) dbUpdate.isActive = updateData.isActive;
      if (updateData.isAdminModules !== undefined) {
        (dbUpdate as typeof this.table.$inferInsert & {
          isAdminModules?: Record<string, boolean>;
        }).isAdminModules = updateData.isAdminModules;
      }

      await tx.update(this.table).set(dbUpdate).where(eq(this.table.id, id));

      const isUpdatingPermissions =
        updateData.permissionIds !== undefined ||
        updateData.permissions !== undefined;

      if (isUpdatingPermissions) {
        let permissionIdsToSet: string[] = [];

        if (
          updateData.permissionIds !== undefined &&
          updateData.permissionIds.length > 0
        ) {
          const validPerms = await tx
            .select({ id: base_tb_permissions.id })
            .from(base_tb_permissions)
            .where(
              and(
                inArray(base_tb_permissions.id, updateData.permissionIds),
                eq(base_tb_permissions.isActive, true),
              ),
            );

          permissionIdsToSet = validPerms.map((p) => p.id);
        } else if (
          updateData.permissions !== undefined &&
          updateData.permissions.length > 0
        ) {
          const validPerms = await tx
            .select({ id: base_tb_permissions.id })
            .from(base_tb_permissions)
            .where(
              and(
                inArray(base_tb_permissions.key, updateData.permissions),
                eq(base_tb_permissions.isActive, true),
              ),
            );

          permissionIdsToSet = validPerms.map((p) => p.id);
        }

        await tx
          .update(base_tb_role_permissions_default)
          .set({ isActive: false })
          .where(eq(base_tb_role_permissions_default.roleId, id));

        if (permissionIdsToSet.length > 0) {
          const existing = await tx
            .select({
              id: base_tb_role_permissions_default.id,
              permissionId: base_tb_role_permissions_default.permissionId,
            })
            .from(base_tb_role_permissions_default)
            .where(eq(base_tb_role_permissions_default.roleId, id));

          const existingByPermId = new Map(
            existing.map((r) => [r.permissionId, r.id]),
          );
          const toReactivate: string[] = [];
          const toInsert: string[] = [];

          for (const permId of permissionIdsToSet) {
            const rowId = existingByPermId.get(permId);

            if (rowId) toReactivate.push(rowId);
            else toInsert.push(permId);
          }

          if (toReactivate.length > 0) {
            await tx
              .update(base_tb_role_permissions_default)
              .set({ isActive: true })
              .where(
                inArray(base_tb_role_permissions_default.id, toReactivate),
              );
          }

          if (toInsert.length > 0) {
            await tx.insert(base_tb_role_permissions_default).values(
              toInsert.map((permissionId) => ({
                roleId: id,
                permissionId,
                isActive: true,
                createdAt: now,
              })),
            );
          }
        }
      }

      const [roleRow] = await tx
        .select()
        .from(this.table)
        .where(eq(this.table.id, id))
        .limit(1);

      if (!roleRow) return null;

      return this.mapToRoleRow(roleRow, tx);
    });

    if (
      role &&
      (updateData.permissions !== undefined ||
        updateData.permissionIds !== undefined ||
        updateData.isActive !== undefined ||
        updateData.isAdminModules !== undefined)
    ) {
      await this.invalidateRoleUsersCache(id);
    }

    return role;
  };

  /**
   * Delete role (RPC: base-role.curd.delete)
   */
  delete = async (params: {
    id: string;
  }): Promise<{ success: boolean; message: string }> => {
    const id = params.id;

    const [role] = await this.db
      .select()
      .from(this.table)
      .where(eq(this.table.id, id))
      .limit(1);

    if (!role) return { success: false, message: "Role not found" };
    if (role.isSystem) return { success: false, message: "System roles cannot be deleted" };

    const [userRole] = await this.db
      .select()
      .from(base_tb_user_roles)
      .where(eq(base_tb_user_roles.roleId, id))
      .limit(1);

    await this.invalidateRoleUsersCache(id);
    await this.db.delete(this.table).where(eq(this.table.id, id));

    return {
      success: true,
      message: userRole
        ? "Role deleted. Users with this role have been unassigned."
        : "Role deleted successfully",
    };
  };
}
