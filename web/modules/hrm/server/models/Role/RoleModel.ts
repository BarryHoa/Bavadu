import { LocaleDataType } from "@base/server/interfaces/Locale";
import { BaseModel } from "@base/server/models/BaseModel";
import {
  base_tb_permissions,
  base_tb_role_permissions_default,
  base_tb_roles,
} from "@base/server/schemas";
import { eq, and } from "drizzle-orm";

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
  description?: LocaleDataType<string> | null;
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
    const results = await this.db
      .select()
      .from(this.table)
      .where(eq(this.table.isActive, true))
      .orderBy(this.table.code);

    return Promise.all(results.map((row) => this.mapToRoleRow(row)));
  }

  getRoleById = async (id: string): Promise<RoleRow | null> => {
    const result = await this.db
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

  getDataById = async (params: { id: string }): Promise<RoleRow | null> => {
    return this.getRoleById(params.id);
  };

  createRole = async (payload: RoleInput): Promise<RoleRow> => {
    const now = new Date();
    const insertData = {
      code: payload.code,
      name: payload.name,
      description:
        payload.description !== null && payload.description !== undefined
          ? String(payload.description)
          : null,
      isSystem: payload.isSystem ?? false,
      isActive:
        payload.isActive === undefined || payload.isActive === null
          ? true
          : payload.isActive,
      createdAt: now,
      updatedAt: now,
    };

    const [created] = await this.db
      .insert(this.table)
      .values(insertData)
      .returning({ id: this.table.id });

    if (!created) {
      throw new Error("Failed to create role");
    }

    // Add permissions to role_permissions_default if provided
    if (payload.permissions && payload.permissions.length > 0) {
      for (const permKey of payload.permissions) {
        const perm = await this.db
          .select({ id: base_tb_permissions.id })
          .from(base_tb_permissions)
          .where(eq(base_tb_permissions.key, permKey))
          .limit(1);

        if (perm[0]) {
          await this.db.insert(base_tb_role_permissions_default).values({
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
      updateData.description =
        payload.description !== null && payload.description !== undefined
          ? String(payload.description)
          : null;
    if (payload.isActive !== undefined) updateData.isActive = payload.isActive;

    await this.db
      .update(this.table)
      .set(updateData)
      .where(eq(this.table.id, id));

    // Update permissions if provided
    if (payload.permissions !== undefined) {
      // Get permission IDs from keys
      const permissionIds: string[] = [];
      for (const permKey of payload.permissions) {
        const perm = await this.db
          .select({ id: base_tb_permissions.id })
          .from(base_tb_permissions)
          .where(eq(base_tb_permissions.key, permKey))
          .limit(1);

        if (perm[0]) {
          permissionIds.push(perm[0].id);
        }
      }

      // Remove all current permissions
      await this.db
        .update(base_tb_role_permissions_default)
        .set({ isActive: false })
        .where(eq(base_tb_role_permissions_default.roleId, id));

      // Add new permissions
      const now = new Date();
      for (const permissionId of permissionIds) {
        // Check if exists
        const existing = await this.db
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
          await this.db
            .update(base_tb_role_permissions_default)
            .set({ isActive: true })
            .where(eq(base_tb_role_permissions_default.id, existing[0].id));
        } else {
          // Insert new
          await this.db.insert(base_tb_role_permissions_default).values({
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
      normalizedPayload.description = this.normalizeLocaleInput(
        payload.description
      );
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

  private async mapToRoleRow(
    row: typeof base_tb_roles.$inferSelect
  ): Promise<RoleRow> {
    // Get permissions for this role
    const permissions = await this.db
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
