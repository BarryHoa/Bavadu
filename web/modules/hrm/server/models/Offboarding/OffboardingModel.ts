import { BaseModel } from "@base/server/models/BaseModel";
import { eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { NewHrmTbOffboarding, hrm_tb_offboardings } from "../../schemas";
import { hrm_tb_employees } from "../../schemas/hrm.employee";

const employee = alias(hrm_tb_employees, "employee");

export interface OffboardingRow {
  id: string;
  employeeId: string;
  employee?: {
    id: string;
    employeeCode?: string;
    fullName?: unknown;
  } | null;
  resignationDate: string;
  lastWorkingDate: string;
  reason?: string | null;
  reasonDetails?: string | null;
  exitInterviewDate?: string | null;
  exitInterviewNotes?: string | null;
  handoverNotes?: string | null;
  assetsReturned?: unknown;
  status: string;
  completedDate?: string | null;
  createdAt?: number;
  updatedAt?: number;
}

export interface OffboardingInput {
  employeeId: string;
  resignationDate: string;
  lastWorkingDate: string;
  reason?: string | null;
  reasonDetails?: string | null;
  exitInterviewDate?: string | null;
  exitInterviewNotes?: string | null;
  handoverNotes?: string | null;
  assetsReturned?: unknown;
  status?: string;
}

export default class OffboardingModel extends BaseModel<
  typeof hrm_tb_offboardings
> {
  constructor() {
    super(hrm_tb_offboardings);
  }

  getOffboardingById = async (id: string): Promise<OffboardingRow | null> => {
    const result = await this.db
      .select({
        id: this.table.id,
        employeeId: this.table.employeeId,
        employeeCode: employee.employeeCode,
        employeeFullName: employee.fullName,
        resignationDate: this.table.resignationDate,
        lastWorkingDate: this.table.lastWorkingDate,
        reason: this.table.reason,
        reasonDetails: this.table.reasonDetails,
        exitInterviewDate: this.table.exitInterviewDate,
        exitInterviewNotes: this.table.exitInterviewNotes,
        handoverNotes: this.table.handoverNotes,
        assetsReturned: this.table.assetsReturned,
        status: this.table.status,
        completedDate: this.table.completedDate,
        createdAt: this.table.createdAt,
        updatedAt: this.table.updatedAt,
      })
      .from(this.table)
      .leftJoin(employee, eq(this.table.employeeId, employee.id))
      .where(eq(this.table.id, id))
      .limit(1);

    const row = result[0];

    if (!row) return null;

    return {
      id: row.id,
      employeeId: row.employeeId,
      employee: row.employeeId
        ? {
            id: row.employeeId,
            employeeCode: row.employeeCode ?? undefined,
            fullName: row.employeeFullName ?? undefined,
          }
        : null,
      resignationDate: row.resignationDate,
      lastWorkingDate: row.lastWorkingDate,
      reason: row.reason ?? undefined,
      reasonDetails: row.reasonDetails ?? undefined,
      exitInterviewDate: row.exitInterviewDate ?? undefined,
      exitInterviewNotes: row.exitInterviewNotes ?? undefined,
      handoverNotes: row.handoverNotes ?? undefined,
      assetsReturned: row.assetsReturned,
      status: row.status,
      completedDate: row.completedDate ?? undefined,
      createdAt: row.createdAt?.getTime(),
      updatedAt: row.updatedAt?.getTime(),
    };
  };

  getDataById = async (params: {
    id: string;
  }): Promise<OffboardingRow | null> => {
    return this.getOffboardingById(params.id);
  };

  createOffboarding = async (
    payload: OffboardingInput,
  ): Promise<OffboardingRow> => {
    const now = new Date();
    const insertData: NewHrmTbOffboarding = {
      employeeId: payload.employeeId,
      resignationDate: payload.resignationDate,
      lastWorkingDate: payload.lastWorkingDate,
      reason: payload.reason ?? null,
      reasonDetails: payload.reasonDetails ?? null,
      exitInterviewDate: payload.exitInterviewDate ?? null,
      exitInterviewNotes: payload.exitInterviewNotes ?? null,
      handoverNotes: payload.handoverNotes ?? null,
      assetsReturned: payload.assetsReturned ?? null,
      status: payload.status ?? "initiated",
      createdAt: now,
      updatedAt: now,
    };

    const [created] = await this.db
      .insert(this.table)
      .values(insertData)
      .returning({ id: this.table.id });

    if (!created) throw new Error("Failed to create offboarding");

    const offboarding = await this.getOffboardingById(created.id);

    if (!offboarding)
      throw new Error("Failed to load offboarding after creation");

    return offboarding;
  };

  updateOffboarding = async (
    id: string,
    payload: Partial<OffboardingInput>,
  ): Promise<OffboardingRow | null> => {
    const updateData: Partial<typeof this.table.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (payload.employeeId !== undefined)
      updateData.employeeId = payload.employeeId;
    if (payload.resignationDate !== undefined)
      updateData.resignationDate = payload.resignationDate;
    if (payload.lastWorkingDate !== undefined)
      updateData.lastWorkingDate = payload.lastWorkingDate;
    if (payload.reason !== undefined)
      updateData.reason = payload.reason ?? null;
    if (payload.reasonDetails !== undefined)
      updateData.reasonDetails = payload.reasonDetails ?? null;
    if (payload.exitInterviewDate !== undefined)
      updateData.exitInterviewDate = payload.exitInterviewDate ?? null;
    if (payload.exitInterviewNotes !== undefined)
      updateData.exitInterviewNotes = payload.exitInterviewNotes ?? null;
    if (payload.handoverNotes !== undefined)
      updateData.handoverNotes = payload.handoverNotes ?? null;
    if (payload.assetsReturned !== undefined)
      updateData.assetsReturned = payload.assetsReturned ?? null;
    if (payload.status !== undefined) {
      updateData.status = payload.status;
      if (payload.status === "completed") {
        updateData.completedDate = new Date().toISOString().split("T")[0];
      }
    }

    await this.db
      .update(this.table)
      .set(updateData)
      .where(eq(this.table.id, id));

    return this.getOffboardingById(id);
  };

  updateData = async (params: { id: string; payload: any }) => {
    const { id, payload } = params;
    const normalizedPayload: Partial<OffboardingInput> = {};

    if (payload.employeeId !== undefined) {
      normalizedPayload.employeeId = String(payload.employeeId);
    }
    if (payload.resignationDate !== undefined) {
      normalizedPayload.resignationDate = String(payload.resignationDate);
    }
    if (payload.lastWorkingDate !== undefined) {
      normalizedPayload.lastWorkingDate = String(payload.lastWorkingDate);
    }
    if (payload.reason !== undefined) {
      normalizedPayload.reason =
        payload.reason === null || payload.reason === ""
          ? null
          : String(payload.reason);
    }
    if (payload.reasonDetails !== undefined) {
      normalizedPayload.reasonDetails =
        payload.reasonDetails === null || payload.reasonDetails === ""
          ? null
          : String(payload.reasonDetails);
    }
    if (payload.exitInterviewDate !== undefined) {
      normalizedPayload.exitInterviewDate =
        payload.exitInterviewDate === null || payload.exitInterviewDate === ""
          ? null
          : String(payload.exitInterviewDate);
    }
    if (payload.exitInterviewNotes !== undefined) {
      normalizedPayload.exitInterviewNotes =
        payload.exitInterviewNotes === null || payload.exitInterviewNotes === ""
          ? null
          : String(payload.exitInterviewNotes);
    }
    if (payload.handoverNotes !== undefined) {
      normalizedPayload.handoverNotes =
        payload.handoverNotes === null || payload.handoverNotes === ""
          ? null
          : String(payload.handoverNotes);
    }
    if (payload.assetsReturned !== undefined) {
      normalizedPayload.assetsReturned = payload.assetsReturned;
    }
    if (payload.status !== undefined) {
      normalizedPayload.status = String(payload.status);
    }

    return this.updateOffboarding(id, normalizedPayload);
  };
}
