import { LocaleDataType } from "@base/server/interfaces/Locale";
import { BaseModel } from "@base/server/models/BaseModel";
import { eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { NewHrmTbOnboardingChecklist, hrm_tb_onboarding_checklists } from "../../schemas";
import { hrm_tb_employees } from "../../schemas/hrm.employee";

const employee = alias(hrm_tb_employees, "employee");
const assignedEmployee = alias(hrm_tb_employees, "assigned_employee");

export interface OnboardingChecklistRow {
  id: string;
  employeeId: string;
  employee?: {
    id: string;
    employeeCode?: string;
    fullName?: unknown;
  } | null;
  taskName?: unknown;
  taskDescription?: unknown;
  category?: string | null;
  assignedTo?: string | null;
  assignedEmployee?: {
    id: string;
    employeeCode?: string;
    fullName?: unknown;
  } | null;
  dueDate?: string | null;
  completedDate?: string | null;
  isCompleted: boolean;
  notes?: string | null;
  createdAt?: number;
  updatedAt?: number;
}

export interface OnboardingChecklistInput {
  employeeId: string;
  taskName: LocaleDataType<string>;
  taskDescription?: LocaleDataType<string> | null;
  category?: string | null;
  assignedTo?: string | null;
  dueDate?: string | null;
  isCompleted?: boolean;
  notes?: string | null;
}

export default class OnboardingChecklistModel extends BaseModel<
  typeof hrm_tb_onboarding_checklists
> {
  constructor() {
    super(hrm_tb_onboarding_checklists);
  }

  private normalizeLocaleInput(value: unknown): LocaleDataType<string> | null {
    if (!value) return null;
    if (typeof value === "string") return { en: value };
    if (typeof value === "object") return value as LocaleDataType<string>;
    return null;
  }

  getOnboardingChecklistById = async (
    id: string
  ): Promise<OnboardingChecklistRow | null> => {
    const result = await this.db
      .select({
        id: this.table.id,
        employeeId: this.table.employeeId,
        employeeCode: employee.employeeCode,
        employeeFullName: employee.fullName,
        taskName: this.table.taskName,
        taskDescription: this.table.taskDescription,
        category: this.table.category,
        assignedTo: this.table.assignedTo,
        assignedEmployeeCode: assignedEmployee.employeeCode,
        assignedEmployeeFullName: assignedEmployee.fullName,
        dueDate: this.table.dueDate,
        completedDate: this.table.completedDate,
        isCompleted: this.table.isCompleted,
        notes: this.table.notes,
        createdAt: this.table.createdAt,
        updatedAt: this.table.updatedAt,
      })
      .from(this.table)
      .leftJoin(employee, eq(this.table.employeeId, employee.id))
      .leftJoin(assignedEmployee, eq(this.table.assignedTo, assignedEmployee.id))
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
      taskName: row.taskName,
      taskDescription: row.taskDescription,
      category: row.category ?? undefined,
      assignedTo: row.assignedTo ?? undefined,
      assignedEmployee: row.assignedTo
        ? {
            id: row.assignedTo,
            employeeCode: row.assignedEmployeeCode ?? undefined,
            fullName: row.assignedEmployeeFullName ?? undefined,
          }
        : null,
      dueDate: row.dueDate ?? undefined,
      completedDate: row.completedDate ?? undefined,
      isCompleted: row.isCompleted,
      notes: row.notes ?? undefined,
      createdAt: row.createdAt?.getTime(),
      updatedAt: row.updatedAt?.getTime(),
    };
  };

  getDataById = async (params: {
    id: string;
  }): Promise<OnboardingChecklistRow | null> => {
    return this.getOnboardingChecklistById(params.id);
  };

  createOnboardingChecklist = async (
    payload: OnboardingChecklistInput
  ): Promise<OnboardingChecklistRow> => {
    const now = new Date();
    const insertData: NewHrmTbOnboardingChecklist = {
      employeeId: payload.employeeId,
      taskName: payload.taskName,
      taskDescription: payload.taskDescription ? (typeof payload.taskDescription === "string" ? payload.taskDescription : JSON.stringify(payload.taskDescription)) : null,
      category: payload.category ?? null,
      assignedTo: payload.assignedTo ?? null,
      dueDate: payload.dueDate ?? null,
      isCompleted: payload.isCompleted ?? false,
      notes: payload.notes ?? null,
      createdAt: now,
      updatedAt: now,
    };

    const [created] = await this.db
      .insert(this.table)
      .values(insertData)
      .returning({ id: this.table.id });

    if (!created) throw new Error("Failed to create onboarding checklist");

    const checklist = await this.getOnboardingChecklistById(created.id);
    if (!checklist)
      throw new Error("Failed to load onboarding checklist after creation");
    return checklist;
  };

  updateOnboardingChecklist = async (
    id: string,
    payload: Partial<OnboardingChecklistInput>
  ): Promise<OnboardingChecklistRow | null> => {
    const updateData: Partial<typeof this.table.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (payload.employeeId !== undefined)
      updateData.employeeId = payload.employeeId;
    if (payload.taskName !== undefined) updateData.taskName = payload.taskName;
    if (payload.taskDescription !== undefined)
      updateData.taskDescription = payload.taskDescription ? (typeof payload.taskDescription === "string" ? payload.taskDescription : JSON.stringify(payload.taskDescription)) : null;
    if (payload.category !== undefined)
      updateData.category = payload.category ?? null;
    if (payload.assignedTo !== undefined)
      updateData.assignedTo = payload.assignedTo ?? null;
    if (payload.dueDate !== undefined)
      updateData.dueDate = payload.dueDate ?? null;
    if (payload.isCompleted !== undefined) {
      updateData.isCompleted = payload.isCompleted;
      if (payload.isCompleted) {
        updateData.completedDate = new Date().toISOString().split("T")[0];
      }
    }
    if (payload.notes !== undefined) updateData.notes = payload.notes ?? null;

    await this.db
      .update(this.table)
      .set(updateData)
      .where(eq(this.table.id, id));
    return this.getOnboardingChecklistById(id);
  };

  updateData = async (params: { id: string; payload: any }) => {
    const { id, payload } = params;
    const normalizedPayload: Partial<OnboardingChecklistInput> = {};

    if (payload.employeeId !== undefined) {
      normalizedPayload.employeeId = String(payload.employeeId);
    }
    if (payload.taskName !== undefined) {
      normalizedPayload.taskName = this.normalizeLocaleInput(payload.taskName) ?? {
        en: "",
      };
    }
    if (payload.taskDescription !== undefined) {
      normalizedPayload.taskDescription = this.normalizeLocaleInput(
        payload.taskDescription
      );
    }
    if (payload.category !== undefined) {
      normalizedPayload.category =
        payload.category === null || payload.category === ""
          ? null
          : String(payload.category);
    }
    if (payload.assignedTo !== undefined) {
      normalizedPayload.assignedTo =
        payload.assignedTo === null || payload.assignedTo === ""
          ? null
          : String(payload.assignedTo);
    }
    if (payload.dueDate !== undefined) {
      normalizedPayload.dueDate =
        payload.dueDate === null || payload.dueDate === ""
          ? null
          : String(payload.dueDate);
    }
    if (payload.isCompleted !== undefined) {
      normalizedPayload.isCompleted = Boolean(payload.isCompleted);
    }
    if (payload.notes !== undefined) {
      normalizedPayload.notes =
        payload.notes === null || payload.notes === "" ? null : String(payload.notes);
    }

    return this.updateOnboardingChecklist(id, normalizedPayload);
  };
}

