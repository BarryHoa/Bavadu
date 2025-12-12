import { LocaleDataType } from "@base/server/interfaces/Locale";
import { BaseModel } from "@base/server/models/BaseModel";
import { eq } from "drizzle-orm";

import { NewTblShift, table_shift } from "../../schemas";

export interface ShiftRow {
  id: string;
  code: string;
  name?: unknown;
  description?: unknown;
  startTime?: string | null;
  endTime?: string | null;
  breakDuration?: number;
  workingHours?: number;
  isNightShift?: boolean;
  isActive?: boolean;
  createdAt?: number;
  updatedAt?: number;
}

export interface ShiftInput {
  code: string;
  name: LocaleDataType<string>;
  description?: LocaleDataType<string> | null;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  breakDuration?: number;
  workingHours: number;
  isNightShift?: boolean;
  isActive?: boolean;
}

export default class ShiftModel extends BaseModel<typeof table_shift> {
  constructor() {
    super(table_shift);
  }

  private normalizeLocaleInput(value: unknown): LocaleDataType<string> | null {
    if (!value) return null;
    if (typeof value === "string") return { en: value };
    if (typeof value === "object") return value as LocaleDataType<string>;
    return null;
  }

  getShiftById = async (id: string): Promise<ShiftRow | null> => {
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
      startTime: row.startTime ?? undefined,
      endTime: row.endTime ?? undefined,
      breakDuration: row.breakDuration ?? undefined,
      workingHours: row.workingHours ?? undefined,
      isNightShift: row.isNightShift ?? undefined,
      isActive: row.isActive ?? undefined,
      createdAt: row.createdAt?.getTime(),
      updatedAt: row.updatedAt?.getTime(),
    };
  };

  getDataById = async (params: { id: string }): Promise<ShiftRow | null> => {
    return this.getShiftById(params.id);
  };

  createShift = async (payload: ShiftInput): Promise<ShiftRow> => {
    const now = new Date();
    const insertData: NewTblShift = {
      code: payload.code,
      name: payload.name,
      description: payload.description ?? null,
      startTime: payload.startTime as any,
      endTime: payload.endTime as any,
      breakDuration: payload.breakDuration ?? 0,
      workingHours: payload.workingHours,
      isNightShift: payload.isNightShift ?? false,
      isActive: payload.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };

    const [created] = await this.db
      .insert(this.table)
      .values(insertData)
      .returning({ id: this.table.id });

    if (!created) throw new Error("Failed to create shift");

    const shift = await this.getShiftById(created.id);
    if (!shift) throw new Error("Failed to load shift after creation");
    return shift;
  };

  updateShift = async (
    id: string,
    payload: Partial<ShiftInput>
  ): Promise<ShiftRow | null> => {
    const updateData: Partial<typeof this.table.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (payload.code !== undefined) updateData.code = payload.code;
    if (payload.name !== undefined) updateData.name = payload.name;
    if (payload.description !== undefined)
      updateData.description = payload.description ?? null;
    if (payload.startTime !== undefined)
      updateData.startTime = payload.startTime as any;
    if (payload.endTime !== undefined)
      updateData.endTime = payload.endTime as any;
    if (payload.breakDuration !== undefined)
      updateData.breakDuration = payload.breakDuration;
    if (payload.workingHours !== undefined)
      updateData.workingHours = payload.workingHours;
    if (payload.isNightShift !== undefined)
      updateData.isNightShift = payload.isNightShift;
    if (payload.isActive !== undefined) updateData.isActive = payload.isActive;

    await this.db.update(this.table).set(updateData).where(eq(this.table.id, id));
    return this.getShiftById(id);
  };

  updateData = async (params: { id: string; payload: any }) => {
    const { id, payload } = params;
    const normalizedPayload: Partial<ShiftInput> = {};

    if (payload.code !== undefined) normalizedPayload.code = String(payload.code);
    if (payload.name !== undefined) {
      normalizedPayload.name = this.normalizeLocaleInput(payload.name) ?? { en: "" };
    }
    if (payload.description !== undefined) {
      normalizedPayload.description = this.normalizeLocaleInput(payload.description);
    }
    if (payload.startTime !== undefined) {
      normalizedPayload.startTime = String(payload.startTime);
    }
    if (payload.endTime !== undefined) {
      normalizedPayload.endTime = String(payload.endTime);
    }
    if (payload.breakDuration !== undefined) {
      normalizedPayload.breakDuration = Number(payload.breakDuration);
    }
    if (payload.workingHours !== undefined) {
      normalizedPayload.workingHours = Number(payload.workingHours);
    }
    if (payload.isNightShift !== undefined) {
      normalizedPayload.isNightShift = Boolean(payload.isNightShift);
    }
    if (payload.isActive !== undefined) {
      normalizedPayload.isActive = Boolean(payload.isActive);
    }

    return this.updateShift(id, normalizedPayload);
  };
}

