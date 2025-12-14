import { LocaleDataType } from "@base/server/interfaces/Locale";
import { BaseModel } from "@base/server/models/BaseModel";
import { eq } from "drizzle-orm";

import { NewHrmTbLeaveType, hrm_tb_leave_types } from "../../schemas";

export interface LeaveTypeRow {
  id: string;
  code: string;
  name?: unknown;
  description?: unknown;
  accrualType: string;
  accrualRate?: number | null;
  maxAccrual?: number | null;
  carryForward?: boolean;
  maxCarryForward?: number | null;
  requiresApproval?: boolean;
  isPaid?: boolean;
  isActive?: boolean;
  createdAt?: number;
  updatedAt?: number;
}

export interface LeaveTypeInput {
  code: string;
  name: LocaleDataType<string>;
  description?: LocaleDataType<string> | null;
  accrualType: string;
  accrualRate?: number | null;
  maxAccrual?: number | null;
  carryForward?: boolean;
  maxCarryForward?: number | null;
  requiresApproval?: boolean;
  isPaid?: boolean;
  isActive?: boolean;
}

export default class LeaveTypeModel extends BaseModel<typeof hrm_tb_leave_types> {
  constructor() {
    super(hrm_tb_leave_types);
  }

  private normalizeLocaleInput(value: unknown): LocaleDataType<string> | null {
    if (!value) return null;
    if (typeof value === "string") return { en: value };
    if (typeof value === "object") return value as LocaleDataType<string>;
    return null;
  }

  getLeaveTypeById = async (id: string): Promise<LeaveTypeRow | null> => {
    const result = await this.db
      .select()
      .from(this.table)
      .where(eq(this.table.id, id))
      .limit(1);

    const row = result[0];
    if (!row) return null;

    return {
      id: row.id,
      code: row.code,
      name: row.name,
      description: row.description,
      accrualType: row.accrualType,
      accrualRate: row.accrualRate ?? undefined,
      maxAccrual: row.maxAccrual ?? undefined,
      carryForward: row.carryForward ?? undefined,
      maxCarryForward: row.maxCarryForward ?? undefined,
      requiresApproval: row.requiresApproval ?? undefined,
      isPaid: row.isPaid ?? undefined,
      isActive: row.isActive ?? undefined,
      createdAt: row.createdAt?.getTime(),
      updatedAt: row.updatedAt?.getTime(),
    };
  };

  getDataById = async (params: { id: string }): Promise<LeaveTypeRow | null> => {
    return this.getLeaveTypeById(params.id);
  };

  createLeaveType = async (payload: LeaveTypeInput): Promise<LeaveTypeRow> => {
    const now = new Date();
    const insertData: NewHrmTbLeaveType = {
      code: payload.code,
      name: payload.name,
      description: payload.description ? (typeof payload.description === "string" ? payload.description : JSON.stringify(payload.description)) : null,
      accrualType: payload.accrualType,
      accrualRate: payload.accrualRate ?? null,
      maxAccrual: payload.maxAccrual ?? null,
      carryForward: payload.carryForward ?? false,
      maxCarryForward: payload.maxCarryForward ?? null,
      requiresApproval: payload.requiresApproval ?? true,
      isPaid: payload.isPaid ?? true,
      isActive: payload.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };

    const [created] = await this.db
      .insert(this.table)
      .values(insertData)
      .returning({ id: this.table.id });

    if (!created) throw new Error("Failed to create leave type");

    const leaveType = await this.getLeaveTypeById(created.id);
    if (!leaveType) throw new Error("Failed to load leave type after creation");
    return leaveType;
  };

  updateLeaveType = async (
    id: string,
    payload: Partial<LeaveTypeInput>
  ): Promise<LeaveTypeRow | null> => {
    const updateData: Partial<typeof this.table.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (payload.code !== undefined) updateData.code = payload.code;
    if (payload.name !== undefined) updateData.name = payload.name;
    if (payload.description !== undefined)
      updateData.description = payload.description ? (typeof payload.description === "string" ? payload.description : JSON.stringify(payload.description)) : null;
    if (payload.accrualType !== undefined)
      updateData.accrualType = payload.accrualType;
    if (payload.accrualRate !== undefined)
      updateData.accrualRate = payload.accrualRate ?? null;
    if (payload.maxAccrual !== undefined)
      updateData.maxAccrual = payload.maxAccrual ?? null;
    if (payload.carryForward !== undefined)
      updateData.carryForward = payload.carryForward;
    if (payload.maxCarryForward !== undefined)
      updateData.maxCarryForward = payload.maxCarryForward ?? null;
    if (payload.requiresApproval !== undefined)
      updateData.requiresApproval = payload.requiresApproval;
    if (payload.isPaid !== undefined) updateData.isPaid = payload.isPaid;
    if (payload.isActive !== undefined) updateData.isActive = payload.isActive;

    await this.db
      .update(this.table)
      .set(updateData)
      .where(eq(this.table.id, id));
    return this.getLeaveTypeById(id);
  };

  updateData = async (params: { id: string; payload: any }) => {
    const { id, payload } = params;
    const normalizedPayload: Partial<LeaveTypeInput> = {};

    if (payload.code !== undefined) normalizedPayload.code = String(payload.code);
    if (payload.name !== undefined) {
      normalizedPayload.name = this.normalizeLocaleInput(payload.name) ?? { en: "" };
    }
    if (payload.description !== undefined) {
      normalizedPayload.description = this.normalizeLocaleInput(payload.description);
    }
    if (payload.accrualType !== undefined) {
      normalizedPayload.accrualType = String(payload.accrualType);
    }
    if (payload.accrualRate !== undefined) {
      normalizedPayload.accrualRate =
        payload.accrualRate === null || payload.accrualRate === ""
          ? null
          : Number(payload.accrualRate);
    }
    if (payload.maxAccrual !== undefined) {
      normalizedPayload.maxAccrual =
        payload.maxAccrual === null || payload.maxAccrual === ""
          ? null
          : Number(payload.maxAccrual);
    }
    if (payload.carryForward !== undefined) {
      normalizedPayload.carryForward = Boolean(payload.carryForward);
    }
    if (payload.maxCarryForward !== undefined) {
      normalizedPayload.maxCarryForward =
        payload.maxCarryForward === null || payload.maxCarryForward === ""
          ? null
          : Number(payload.maxCarryForward);
    }
    if (payload.requiresApproval !== undefined) {
      normalizedPayload.requiresApproval = Boolean(payload.requiresApproval);
    }
    if (payload.isPaid !== undefined) {
      normalizedPayload.isPaid = Boolean(payload.isPaid);
    }
    if (payload.isActive !== undefined) {
      normalizedPayload.isActive = Boolean(payload.isActive);
    }

    return this.updateLeaveType(id, normalizedPayload);
  };
}

