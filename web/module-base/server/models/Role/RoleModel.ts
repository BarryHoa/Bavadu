import { LocaleDataType } from "@base/server/interfaces/Locale";
import { BaseModel } from "@base/server/models/BaseModel";
import { and, eq } from "drizzle-orm";
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
}

export interface RoleInput {
  code: string;
  name: LocaleDataType<string>;
  description?: string | null;
  permissions: string[];
  isSystem?: boolean;
  isActive?: boolean;
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

  /**
   * Get all active roles
   */
  async getRoles(): Promise<RoleRow[]> {
    const db = await this.getDb();
    const results = await db
      .select()
      .from(this.table)
      .where(eq(this.table.isActive, true))
      .orderBy(this.table.code);

    return Promise.all(results.map((row) => this.mapToRoleRow(row)));
  }

  /**
   * Get all roles (including inactive)
   */
  async getAllRoles(): Promise<RoleRow[]> {
    const db = await this.getDb();
    const results = await db
      .select()
      .from(this.table)
      .orderBy(this.table.createdAt);

    return Promise.all(results.map((row) => this.mapToRoleRow(row)));
  }

  getRoleById = async (id: string): Promise<RoleRow | null> => {
    const db = await this.getDb();
    const result = await db
      .select()
      .from(this.table)
      .where(eq(this.table.id, id))
      .limit(1);

    const row = result[0];

    if (!row) {
      return null;
    }

    return this.mapToRoleRow(row);
  };

  /**
   * Get role by code
   */
  async getRoleByCode(code: string): Promise<RoleRow | null> {
    const db = await this.getDb();
    const [result] = await db
      .select()
      .from(this.table)
      .where(eq(this.table.code, code))
      .limit(1);

    if (!result) {
      return null;
    }

    return this.mapToRoleRow(result);
  }

  /**
   * Get role by ID with permissions details
   */
  async getRoleWithPermissions(id: string): Promise<{
    role: RoleRow;
    permissions: Array<{
      id: string;
      key: string;
      module: string;
      resource: string;
      action: string;
      name?: unknown;
      description?: unknown;
    }>;
  } | null> {
    const role = await this.getRoleById(id);
    if (!role) {
      return null;
    }

    const db = await this.getDb();
    const rolePermissions = await db
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
          base_tb_permissions.id
        )
      )
      .where(eq(base_tb_role_permissions_default.roleId, id));

    return {
      role,
      permissions: rolePermissions,
    };
  }

  getDataById = async (params: { id: string }): Promise<RoleRow | null> => {
    return this.getRoleById(params.id);
  };

  createRole = async (payload: RoleInput): Promise<RoleRow> => {
    const now = new Date();
    const insertData = {
      code: payload.code,
      name: payload.name,
      description: payload.description ?? null,
      isSystem: payload.isSystem ?? false,
      isActive:
        payload.isActive === undefined || payload.isActive === null
          ? true
          : payload.isActive,
      createdAt: now,
      updatedAt: now,
    };

    const db = await this.getDb();
    const [created] = await db
      .insert(this.table)
      .values(insertData)
      .returning({ id: this.table.id });

    if (!created) {
      throw new Error("Failed to create role");
    }

    // Add permissions to role_permissions_default if provided
    if (payload.permissions && payload.permissions.length > 0) {
      // Get permission IDs from keys
      const permissions = await db
        .select({ id: base_tb_permissions.id })
        .from(base_tb_permissions)
        .where(
          and(
            eq(base_tb_permissions.isActive, true)
            // Note: We'd need to filter by keys, but for now we'll handle this differently
          )
        );

      // For now, we'll need to match permission keys to IDs
      // This is a simplified version - you may want to improve this
      for (const permKey of payload.permissions) {
        const perm = await db
          .select({ id: base_tb_permissions.id })
          .from(base_tb_permissions)
          .where(eq(base_tb_permissions.key, permKey))
          .limit(1);

        if (perm[0]) {
          await db.insert(base_tb_role_permissions_default).values({
            roleId: created.id,
            permissionId: perm[0].id,
            isActive: true,
            createdAt: now,
          });
        }
      }
    }

    const role = await this.getRoleById(created.id);
    if (!role) {
      throw new Error("Failed to load role after creation");
    }
    return role;
  };

  updateRole = async (
    id: string,
    payload: Partial<RoleInput>
  ): Promise<RoleRow | null> => {
    const updateData: Partial<typeof this.table.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (payload.code !== undefined) updateData.code = payload.code;
    if (payload.name !== undefined) updateData.name = payload.name;
    if (payload.description !== undefined)
      updateData.description = payload.description ?? null;
    if (payload.isActive !== undefined) updateData.isActive = payload.isActive;

    const db = await this.getDb();
    await db.update(this.table).set(updateData).where(eq(this.table.id, id));

    // Update permissions if provided
    if (payload.permissions !== undefined) {
      // Get permission IDs from keys
      const permissionIds: string[] = [];
      for (const permKey of payload.permissions) {
        const perm = await db
          .select({ id: base_tb_permissions.id })
          .from(base_tb_permissions)
          .where(eq(base_tb_permissions.key, permKey))
          .limit(1);

        if (perm[0]) {
          permissionIds.push(perm[0].id);
        }
      }

      // Remove all current permissions
      await db
        .update(base_tb_role_permissions_default)
        .set({ isActive: false })
        .where(eq(base_tb_role_permissions_default.roleId, id));

      // Add new permissions
      const now = new Date();
      for (const permissionId of permissionIds) {
        // Check if exists
        const existing = await db
          .select()
          .from(base_tb_role_permissions_default)
          .where(
            and(
              eq(base_tb_role_permissions_default.roleId, id),
              eq(base_tb_role_permissions_default.permissionId, permissionId)
            )
          )
          .limit(1);

        if (existing[0]) {
          // Reactivate if inactive
          await db
            .update(base_tb_role_permissions_default)
            .set({ isActive: true })
            .where(eq(base_tb_role_permissions_default.id, existing[0].id));
        } else {
          // Insert new
          await db.insert(base_tb_role_permissions_default).values({
            roleId: id,
            permissionId,
            isActive: true,
            createdAt: now,
          });
        }
      }
    }

    return this.getRoleById(id);
  };

  updateData = async (params: { id: string; payload: any }) => {
    const { id, payload } = params;

    const normalizedPayload: Partial<RoleInput> = {};

    if (payload.code !== undefined) {
      normalizedPayload.code = String(payload.code);
    }
    if (payload.name !== undefined) {
      normalizedPayload.name = this.normalizeLocaleInput(payload.name) ?? {
        en: "",
      };
    }
    if (payload.description !== undefined) {
      normalizedPayload.description =
        payload.description !== null && payload.description !== undefined
          ? String(payload.description)
          : null;
    }
    if (payload.permissions !== undefined) {
      normalizedPayload.permissions = Array.isArray(payload.permissions)
        ? payload.permissions
        : [];
    }
    if (payload.isActive !== undefined) {
      normalizedPayload.isActive = Boolean(payload.isActive);
    }

    return this.updateRole(id, normalizedPayload);
  };

  /**
   * Delete role
   */
  async deleteRole(id: string): Promise<{ success: boolean; message: string }> {
    const db = await this.getDb();

    // Check if role exists
    const [role] = await db
      .select()
      .from(this.table)
      .where(eq(this.table.id, id))
      .limit(1);

    if (!role) {
      return {
        success: false,
        message: "Role not found",
      };
    }

    // Check if role is system role (cannot be deleted)
    if (role.isSystem) {
      return {
        success: false,
        message: "System roles cannot be deleted",
      };
    }

    // Check if role is assigned to any users
    const userRoles = await db
      .select()
      .from(base_tb_user_roles)
      .where(eq(base_tb_user_roles.roleId, id))
      .limit(1);

    // Delete role (cascade will handle related records)
    await db.delete(this.table).where(eq(this.table.id, id));

    return {
      success: true,
      message:
        userRoles.length > 0
          ? "Role deleted. Users with this role have been unassigned."
          : "Role deleted successfully",
    };
  }

  private async mapToRoleRow(
    row: typeof base_tb_roles.$inferSelect
  ): Promise<RoleRow> {
    // Get permissions for this role
    const db = await this.getDb();
    const permissions = await db
      .select({
        permissionKey: base_tb_permissions.key,
      })
      .from(base_tb_role_permissions_default)
      .innerJoin(
        base_tb_permissions,
        eq(
          base_tb_role_permissions_default.permissionId,
          base_tb_permissions.id
        )
      )
      .where(
        and(
          eq(base_tb_role_permissions_default.roleId, row.id),
          eq(base_tb_role_permissions_default.isActive, true),
          eq(base_tb_permissions.isActive, true)
        )
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
    };
  }
}
