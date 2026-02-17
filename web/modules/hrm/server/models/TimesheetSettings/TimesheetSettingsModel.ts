import { eq } from "drizzle-orm";

import { BaseModel } from "@base/server/models/BaseModel";

import {
  hrm_tb_timesheet_settings,
  type HrmTbTimesheetSettings,
  type NewHrmTbTimesheetSettings,
} from "../../schemas";

const DEFAULT_ID = "default";

export type TimesheetSettingsRow = HrmTbTimesheetSettings;

export interface TimesheetSettingsUpdate {
  defaultCheckInTime?: string | null; // "HH:mm"
  defaultCheckOutTime?: string | null;
  breakMinutes?: number;
  maxHoursPerDay?: number | null;
  allowWeekend?: boolean;
  weekStart?: number;
  roundMinutes?: number;
  roundDirection?: string;
  updatedBy?: string | null;
}

export default class TimesheetSettingsModel extends BaseModel<
  typeof hrm_tb_timesheet_settings
> {
  constructor() {
    super(hrm_tb_timesheet_settings);
  }

  /**
   * Get timesheet settings (single row, id = 'default').
   * RPC: timesheet-settings.curd.getSettings
   */
  getSettings = async (): Promise<TimesheetSettingsRow | null> => {
    const rows = await this.db
      .select()
      .from(this.table)
      .where(eq(this.table.id, DEFAULT_ID))
      .limit(1);

    return rows[0] ?? null;
  };

  /**
   * Update timesheet settings.
   * RPC: timesheet-settings.curd.updateSettings
   */
  updateSettings = async (
    params: TimesheetSettingsUpdate,
  ): Promise<TimesheetSettingsRow | null> => {
    const existing = await this.getSettings();

    const payload: Partial<NewHrmTbTimesheetSettings> = {
      updatedAt: new Date(),
      ...(params.defaultCheckInTime !== undefined && {
        defaultCheckInTime: params.defaultCheckInTime,
      }),
      ...(params.defaultCheckOutTime !== undefined && {
        defaultCheckOutTime: params.defaultCheckOutTime,
      }),
      ...(params.breakMinutes !== undefined && {
        breakMinutes: params.breakMinutes,
      }),
      ...(params.maxHoursPerDay !== undefined && {
        maxHoursPerDay: params.maxHoursPerDay,
      }),
      ...(params.allowWeekend !== undefined && {
        allowWeekend: params.allowWeekend,
      }),
      ...(params.weekStart !== undefined && { weekStart: params.weekStart }),
      ...(params.roundMinutes !== undefined && {
        roundMinutes: params.roundMinutes,
      }),
      ...(params.roundDirection !== undefined && {
        roundDirection: params.roundDirection,
      }),
      ...(params.updatedBy !== undefined && {
        updatedBy: params.updatedBy,
      }),
    };

    if (existing) {
      await this.db
        .update(this.table)
        .set(payload)
        .where(eq(this.table.id, DEFAULT_ID));
    } else {
      await this.db.insert(this.table).values({
        id: DEFAULT_ID,
        ...payload,
        createdAt: new Date(),
      } as NewHrmTbTimesheetSettings);
    }

    return this.getSettings();
  };
}
