import { LocaleDataType } from "@base/server/interfaces/Locale";
import { BaseModel } from "@base/server/models/BaseModel";
import { eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { NewHrmTbDepartment, hrm_tb_departments } from "../../schemas";

const parentDepartment = alias(hrm_tb_departments, "parent_department");

export interface DepartmentRow {
  id: string;
  code: string;
  name?: unknown;
  description?: unknown;
  level?: number;
  isActive?: boolean;
  parent?: {
    id: string;
    name?: unknown;
  } | null;
  managerId?: string | null;
  locationId?: string | null;
  createdAt?: number;
  updatedAt?: number;
}

export interface DepartmentInput {
  code: string;
  name: LocaleDataType<string>;
  description?: LocaleDataType<string> | null;
  parentId?: string | null;
  level?: number | null;
  managerId?: string | null;
  locationId?: string | null;
  isActive?: boolean;
}

export default class DepartmentModel extends BaseModel<
  typeof hrm_tb_departments
> {
  constructor() {
    super(hrm_tb_departments);
  }

  private normalizeLocaleInput(value: unknown): LocaleDataType<string> | null {
    if (!value) return null;
    if (typeof value === "string") return { en: value };
    if (typeof value === "object") return value as LocaleDataType<string>;
    return null;
  }

  getDepartmentById = async (id: string): Promise<DepartmentRow | null> => {
    const result = await this.db
      .select({
        id: this.table.id,
        code: this.table.code,
        name: this.table.name,
        description: this.table.description,
        level: this.table.level,
        isActive: this.table.isActive,
        parentId: this.table.parentId,
        parentName: parentDepartment.name,
        managerId: this.table.managerId,
        locationId: this.table.locationId,
        createdAt: this.table.createdAt,
        updatedAt: this.table.updatedAt,
      })
      .from(this.table)
      .leftJoin(
        parentDepartment,
        eq(this.table.parentId, parentDepartment.id)
      )
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
      level: row.level ?? undefined,
      isActive: row.isActive ?? undefined,
      parent: row.parentId
        ? {
            id: row.parentId,
            name: row.parentName ?? undefined,
          }
        : null,
      managerId: row.managerId ?? undefined,
      locationId: row.locationId ?? undefined,
      createdAt: row.createdAt?.getTime(),
      updatedAt: row.updatedAt?.getTime(),
    };
  };

  getDataById = async (params: {
    id: string;
  }): Promise<DepartmentRow | null> => {
    return this.getDepartmentById(params.id);
  };

  createDepartment = async (
    payload: DepartmentInput
  ): Promise<DepartmentRow> => {
    const now = new Date();
    const insertData: NewHrmTbDepartment = {
      code: payload.code,
      name: payload.name,
      description: payload.description ?? null,
      parentId: payload.parentId ?? null,
      managerId: payload.managerId ?? null,
      locationId: payload.locationId ?? null,
      isActive:
        payload.isActive === undefined || payload.isActive === null
          ? true
          : payload.isActive,
      createdAt: now,
      updatedAt: now,
    };

    if (payload.level !== undefined && payload.level !== null) {
      insertData.level = payload.level;
    }

    const [created] = await this.db
      .insert(this.table)
      .values(insertData)
      .returning({ id: this.table.id });

    if (!created) {
      throw new Error("Failed to create department");
    }

    const row = await this.getDepartmentById(created.id);

    if (!row) {
      throw new Error("Failed to load department after creation");
    }

    return row;
  };

  updateDepartment = async (
    id: string,
    payload: Partial<DepartmentInput>
  ): Promise<DepartmentRow | null> => {
    const updateData: Partial<typeof this.table.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (payload.code !== undefined) updateData.code = payload.code;
    if (payload.name !== undefined) updateData.name = payload.name;
    if (payload.description !== undefined)
      updateData.description = payload.description ?? null;
    if (payload.parentId !== undefined)
      updateData.parentId = payload.parentId ?? null;
    if (payload.level !== undefined) {
      if (payload.level !== null) {
        updateData.level = payload.level;
      }
    }
    if (payload.managerId !== undefined)
      updateData.managerId = payload.managerId ?? null;
    if (payload.locationId !== undefined)
      updateData.locationId = payload.locationId ?? null;
    if (payload.isActive !== undefined) updateData.isActive = payload.isActive;

    await this.db.update(this.table).set(updateData).where(eq(this.table.id, id));

    return this.getDepartmentById(id);
  };

  updateData = async (params: { id: string; payload: any }) => {
    const { id, payload } = params;

    const normalizedPayload: Partial<DepartmentInput> = {};

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
    if (payload.parentId !== undefined) {
      normalizedPayload.parentId =
        payload.parentId === null || payload.parentId === ""
          ? null
          : String(payload.parentId);
    }
    if (payload.level !== undefined) {
      normalizedPayload.level =
        payload.level === null || payload.level === ""
          ? null
          : Number(payload.level);
    }
    if (payload.managerId !== undefined) {
      normalizedPayload.managerId =
        payload.managerId === null || payload.managerId === ""
          ? null
          : String(payload.managerId);
    }
    if (payload.locationId !== undefined) {
      normalizedPayload.locationId =
        payload.locationId === null || payload.locationId === ""
          ? null
          : String(payload.locationId);
    }
    if (payload.isActive !== undefined) {
      normalizedPayload.isActive = Boolean(payload.isActive);
    }

    return this.updateDepartment(id, normalizedPayload);
  };
}

