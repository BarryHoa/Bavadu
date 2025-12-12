import { LocaleDataType } from "@base/server/interfaces/Locale";
import { BaseModel } from "@base/server/models/BaseModel";
import { eq } from "drizzle-orm";

import { NewHrmTbRole, hrm_tb_roles } from "../../schemas";

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

export default class RoleModel extends BaseModel<typeof hrm_tb_roles> {
  constructor() {
    super(hrm_tb_roles);
  }

  private normalizeLocaleInput(value: unknown): LocaleDataType<string> | null {
    if (!value) return null;
    if (typeof value === "string") return { en: value };
    if (typeof value === "object") return value as LocaleDataType<string>;
    return null;
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

    return {
      id: row.id,
      code: row.code,
      name: row.name,
      description: row.description,
      permissions: (row.permissions as string[]) ?? [],
      isSystem: row.isSystem ?? undefined,
      isActive: row.isActive ?? undefined,
      createdAt: row.createdAt?.getTime(),
      updatedAt: row.updatedAt?.getTime(),
    };
  };

  getDataById = async (params: { id: string }): Promise<RoleRow | null> => {
    return this.getRoleById(params.id);
  };

  createRole = async (payload: RoleInput): Promise<RoleRow> => {
    const now = new Date();
    const insertData: NewHrmTbRole = {
      code: payload.code,
      name: payload.name,
      description: payload.description ?? null,
      permissions: payload.permissions,
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
    if (payload.permissions !== undefined)
      updateData.permissions = payload.permissions;
    if (payload.isActive !== undefined) updateData.isActive = payload.isActive;

    await this.db.update(this.table).set(updateData).where(eq(this.table.id, id));

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
}

