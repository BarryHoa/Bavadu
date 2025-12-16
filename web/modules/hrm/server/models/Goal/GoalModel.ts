import { LocaleDataType } from "@base/server/interfaces/Locale";
import { BaseModel } from "@base/server/models/BaseModel";
import { eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { NewHrmTbGoal, hrm_tb_goals } from "../../schemas";
import { hrm_tb_employees } from "../../schemas/hrm.employee";

const employee = alias(hrm_tb_employees, "employee");

export interface GoalRow {
  id: string;
  employeeId: string;
  employee?: {
    id: string;
    employeeCode?: string;
    fullName?: unknown;
  } | null;
  goalType: string;
  title?: unknown;
  description?: unknown;
  targetValue?: number | null;
  currentValue: number;
  unit?: string | null;
  period: string;
  startDate: string;
  endDate: string;
  status: string;
  progress: number;
  createdAt?: number;
  updatedAt?: number;
}

export interface GoalInput {
  employeeId: string;
  goalType: string;
  title: LocaleDataType<string>;
  description?: LocaleDataType<string> | null;
  targetValue?: number | null;
  currentValue?: number;
  unit?: string | null;
  period: string;
  startDate: string;
  endDate: string;
  status?: string;
}

export default class GoalModel extends BaseModel<typeof hrm_tb_goals> {
  constructor() {
    super(hrm_tb_goals);
  }

  private normalizeLocaleInput(value: unknown): LocaleDataType<string> | null {
    if (!value) return null;
    if (typeof value === "string") return { en: value };
    if (typeof value === "object") return value as LocaleDataType<string>;

    return null;
  }

  getGoalById = async (id: string): Promise<GoalRow | null> => {
    const result = await this.db
      .select({
        id: this.table.id,
        employeeId: this.table.employeeId,
        employeeCode: employee.employeeCode,
        employeeFullName: employee.fullName,
        goalType: this.table.goalType,
        title: this.table.title,
        description: this.table.description,
        targetValue: this.table.targetValue,
        currentValue: this.table.currentValue,
        unit: this.table.unit,
        period: this.table.period,
        startDate: this.table.startDate,
        endDate: this.table.endDate,
        status: this.table.status,
        progress: this.table.progress,
        createdAt: this.table.createdAt,
        updatedAt: this.table.updatedAt,
      })
      .from(this.table)
      .leftJoin(employee, eq(this.table.employeeId, employee.id))
      .where(eq(this.table.id, id))
      .limit(1);

    const row = result[0];

    if (!row) return null;

    // Calculate progress if target value exists
    const currentValue = row.currentValue ?? 0;
    const progress =
      row.targetValue && row.targetValue > 0
        ? Math.min(100, Math.round((currentValue / row.targetValue) * 100))
        : 0;

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
      goalType: row.goalType,
      title: row.title,
      description: row.description,
      targetValue: row.targetValue ?? undefined,
      currentValue: row.currentValue ?? 0,
      unit: row.unit ?? undefined,
      period: row.period,
      startDate: row.startDate,
      endDate: row.endDate,
      status: row.status,
      progress: progress,
      createdAt: row.createdAt?.getTime(),
      updatedAt: row.updatedAt?.getTime(),
    };
  };

  getDataById = async (params: { id: string }): Promise<GoalRow | null> => {
    return this.getGoalById(params.id);
  };

  createGoal = async (payload: GoalInput): Promise<GoalRow> => {
    const now = new Date();
    const progress =
      payload.targetValue && payload.targetValue > 0
        ? Math.min(
            100,
            Math.round(
              ((payload.currentValue ?? 0) / payload.targetValue) * 100,
            ),
          )
        : 0;

    const insertData: NewHrmTbGoal = {
      employeeId: payload.employeeId,
      goalType: payload.goalType,
      title: payload.title,
      description: payload.description
        ? typeof payload.description === "string"
          ? payload.description
          : JSON.stringify(payload.description)
        : null,
      targetValue: payload.targetValue ?? null,
      currentValue: payload.currentValue ?? 0,
      unit: payload.unit ?? null,
      period: payload.period,
      startDate: payload.startDate,
      endDate: payload.endDate,
      status: payload.status ?? "active",
      progress: progress,
      createdAt: now,
      updatedAt: now,
    };

    const [created] = await this.db
      .insert(this.table)
      .values(insertData)
      .returning({ id: this.table.id });

    if (!created) throw new Error("Failed to create goal");

    const goal = await this.getGoalById(created.id);

    if (!goal) throw new Error("Failed to load goal after creation");

    return goal;
  };

  updateGoal = async (
    id: string,
    payload: Partial<GoalInput>,
  ): Promise<GoalRow | null> => {
    const updateData: Partial<typeof this.table.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (payload.employeeId !== undefined)
      updateData.employeeId = payload.employeeId;
    if (payload.goalType !== undefined) updateData.goalType = payload.goalType;
    if (payload.title !== undefined) updateData.title = payload.title;
    if (payload.description !== undefined)
      updateData.description = payload.description
        ? typeof payload.description === "string"
          ? payload.description
          : JSON.stringify(payload.description)
        : null;
    if (payload.targetValue !== undefined)
      updateData.targetValue = payload.targetValue ?? null;
    if (payload.currentValue !== undefined)
      updateData.currentValue = payload.currentValue;
    if (payload.unit !== undefined) updateData.unit = payload.unit ?? null;
    if (payload.period !== undefined) updateData.period = payload.period;
    if (payload.startDate !== undefined)
      updateData.startDate = payload.startDate;
    if (payload.endDate !== undefined) updateData.endDate = payload.endDate;
    if (payload.status !== undefined) updateData.status = payload.status;

    // Recalculate progress if target or current value changed
    if (
      payload.targetValue !== undefined ||
      payload.currentValue !== undefined
    ) {
      const existing = await this.getGoalById(id);

      if (existing) {
        const targetValue = updateData.targetValue ?? existing.targetValue;
        const currentValue = updateData.currentValue ?? existing.currentValue;

        if (targetValue && targetValue > 0) {
          updateData.progress = Math.min(
            100,
            Math.round((currentValue / targetValue) * 100),
          );
        } else {
          updateData.progress = 0;
        }
      }
    }

    await this.db
      .update(this.table)
      .set(updateData)
      .where(eq(this.table.id, id));

    return this.getGoalById(id);
  };

  updateData = async (params: { id: string; payload: any }) => {
    const { id, payload } = params;
    const normalizedPayload: Partial<GoalInput> = {};

    if (payload.employeeId !== undefined) {
      normalizedPayload.employeeId = String(payload.employeeId);
    }
    if (payload.goalType !== undefined) {
      normalizedPayload.goalType = String(payload.goalType);
    }
    if (payload.title !== undefined) {
      normalizedPayload.title = this.normalizeLocaleInput(payload.title) ?? {
        en: "",
      };
    }
    if (payload.description !== undefined) {
      normalizedPayload.description = this.normalizeLocaleInput(
        payload.description,
      );
    }
    if (payload.targetValue !== undefined) {
      normalizedPayload.targetValue =
        payload.targetValue === null || payload.targetValue === ""
          ? null
          : Number(payload.targetValue);
    }
    if (payload.currentValue !== undefined) {
      normalizedPayload.currentValue = Number(payload.currentValue);
    }
    if (payload.unit !== undefined) {
      normalizedPayload.unit =
        payload.unit === null || payload.unit === ""
          ? null
          : String(payload.unit);
    }
    if (payload.period !== undefined) {
      normalizedPayload.period = String(payload.period);
    }
    if (payload.startDate !== undefined) {
      normalizedPayload.startDate = String(payload.startDate);
    }
    if (payload.endDate !== undefined) {
      normalizedPayload.endDate = String(payload.endDate);
    }
    if (payload.status !== undefined) {
      normalizedPayload.status = String(payload.status);
    }

    return this.updateGoal(id, normalizedPayload);
  };
}
