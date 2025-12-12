import { LocaleDataType } from "@base/server/interfaces/Locale";
import { BaseModel } from "@base/server/models/BaseModel";
import { eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { NewHrmTbPosition, hrm_tb_positions } from "../../schemas";
import { hrm_tb_departments } from "../../schemas/hrm.department";

const department = alias(hrm_tb_departments, "department");

export interface PositionRow {
  id: string;
  code: string;
  name?: unknown;
  description?: unknown;
  departmentId: string;
  department?: {
    id: string;
    name?: unknown;
  } | null;
  jobFamily?: string | null;
  jobGrade?: string | null;
  reportsTo?: string | null;
  reportingPosition?: {
    id: string;
    name?: unknown;
  } | null;
  minSalary?: number | null;
  maxSalary?: number | null;
  isActive?: boolean;
  createdAt?: number;
  updatedAt?: number;
}

export interface PositionInput {
  code: string;
  name: LocaleDataType<string>;
  description?: LocaleDataType<string> | null;
  departmentId: string;
  jobFamily?: string | null;
  jobGrade?: string | null;
  reportsTo?: string | null;
  minSalary?: number | null;
  maxSalary?: number | null;
  isActive?: boolean;
}

export default class PositionModel extends BaseModel<typeof hrm_tb_positions> {
  constructor() {
    super(hrm_tb_positions);
  }

  private normalizeLocaleInput(value: unknown): LocaleDataType<string> | null {
    if (!value) return null;
    if (typeof value === "string") return { en: value };
    if (typeof value === "object") return value as LocaleDataType<string>;
    return null;
  }

  getPositionById = async (id: string): Promise<PositionRow | null> => {
    const reportingPosition = alias(hrm_tb_positions, "reporting_position");
    const result = await this.db
      .select({
        id: this.table.id,
        code: this.table.code,
        name: this.table.name,
        description: this.table.description,
        departmentId: this.table.departmentId,
        departmentName: department.name,
        jobFamily: this.table.jobFamily,
        jobGrade: this.table.jobGrade,
        reportsTo: this.table.reportsTo,
        reportingPositionName: reportingPosition.name,
        minSalary: this.table.minSalary,
        maxSalary: this.table.maxSalary,
        isActive: this.table.isActive,
        createdAt: this.table.createdAt,
        updatedAt: this.table.updatedAt,
      })
      .from(this.table)
      .leftJoin(department, eq(this.table.departmentId, department.id))
      .leftJoin(reportingPosition, eq(this.table.reportsTo, reportingPosition.id))
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
      departmentId: row.departmentId,
      department: row.departmentId
        ? {
            id: row.departmentId,
            name: row.departmentName ?? undefined,
          }
        : null,
      jobFamily: row.jobFamily ?? undefined,
      jobGrade: row.jobGrade ?? undefined,
      reportsTo: row.reportsTo ?? undefined,
      reportingPosition: row.reportsTo
        ? {
            id: row.reportsTo,
            name: row.reportingPositionName ?? undefined,
          }
        : null,
      minSalary: row.minSalary ?? undefined,
      maxSalary: row.maxSalary ?? undefined,
      isActive: row.isActive ?? undefined,
      createdAt: row.createdAt?.getTime(),
      updatedAt: row.updatedAt?.getTime(),
    };
  };

  getDataById = async (params: {
    id: string;
  }): Promise<PositionRow | null> => {
    return this.getPositionById(params.id);
  };

  createPosition = async (payload: PositionInput): Promise<PositionRow> => {
    const now = new Date();
    const insertData: NewHrmTbPosition = {
      code: payload.code,
      name: payload.name,
      description: payload.description ?? null,
      departmentId: payload.departmentId,
      jobFamily: payload.jobFamily ?? null,
      jobGrade: payload.jobGrade ?? null,
      reportsTo: payload.reportsTo ?? null,
      minSalary: payload.minSalary ?? null,
      maxSalary: payload.maxSalary ?? null,
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
      throw new Error("Failed to create position");
    }

    const row = await this.getPositionById(created.id);

    if (!row) {
      throw new Error("Failed to load position after creation");
    }

    return row;
  };

  updatePosition = async (
    id: string,
    payload: Partial<PositionInput>
  ): Promise<PositionRow | null> => {
    const updateData: Partial<typeof this.table.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (payload.code !== undefined) updateData.code = payload.code;
    if (payload.name !== undefined) updateData.name = payload.name;
    if (payload.description !== undefined)
      updateData.description = payload.description ?? null;
    if (payload.departmentId !== undefined)
      updateData.departmentId = payload.departmentId;
    if (payload.jobFamily !== undefined)
      updateData.jobFamily = payload.jobFamily ?? null;
    if (payload.jobGrade !== undefined)
      updateData.jobGrade = payload.jobGrade ?? null;
    if (payload.reportsTo !== undefined)
      updateData.reportsTo = payload.reportsTo ?? null;
    if (payload.minSalary !== undefined)
      updateData.minSalary = payload.minSalary ?? null;
    if (payload.maxSalary !== undefined)
      updateData.maxSalary = payload.maxSalary ?? null;
    if (payload.isActive !== undefined) updateData.isActive = payload.isActive;

    await this.db.update(this.table).set(updateData).where(eq(this.table.id, id));

    return this.getPositionById(id);
  };

  updateData = async (params: { id: string; payload: any }) => {
    const { id, payload } = params;

    const normalizedPayload: Partial<PositionInput> = {};

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
    if (payload.departmentId !== undefined) {
      normalizedPayload.departmentId = String(payload.departmentId);
    }
    if (payload.jobFamily !== undefined) {
      normalizedPayload.jobFamily =
        payload.jobFamily === null || payload.jobFamily === ""
          ? null
          : String(payload.jobFamily);
    }
    if (payload.jobGrade !== undefined) {
      normalizedPayload.jobGrade =
        payload.jobGrade === null || payload.jobGrade === ""
          ? null
          : String(payload.jobGrade);
    }
    if (payload.reportsTo !== undefined) {
      normalizedPayload.reportsTo =
        payload.reportsTo === null || payload.reportsTo === ""
          ? null
          : String(payload.reportsTo);
    }
    if (payload.minSalary !== undefined) {
      normalizedPayload.minSalary =
        payload.minSalary === null || payload.minSalary === ""
          ? null
          : Number(payload.minSalary);
    }
    if (payload.maxSalary !== undefined) {
      normalizedPayload.maxSalary =
        payload.maxSalary === null || payload.maxSalary === ""
          ? null
          : Number(payload.maxSalary);
    }
    if (payload.isActive !== undefined) {
      normalizedPayload.isActive = Boolean(payload.isActive);
    }

    return this.updatePosition(id, normalizedPayload);
  };
}

