import JsonRpcClientService from "@base/client/services/JsonRpcClientService";

export interface TimesheetSettingsDto {
  id: string;
  defaultCheckInTime?: string | null;
  defaultCheckOutTime?: string | null;
  breakMinutes: number;
  maxHoursPerDay?: number | null;
  allowWeekend: boolean;
  weekStart: number;
  roundMinutes: number;
  roundDirection: string;
  createdAt?: string | number | null;
  updatedAt?: string | number | null;
  updatedBy?: string | null;
}

export interface TimesheetSettingsUpdatePayload {
  defaultCheckInTime?: string | null;
  defaultCheckOutTime?: string | null;
  breakMinutes?: number;
  maxHoursPerDay?: number | null;
  allowWeekend?: boolean;
  weekStart?: number;
  roundMinutes?: number;
  roundDirection?: string;
  updatedBy?: string | null;
}

export default class TimesheetSettingsService extends JsonRpcClientService {
  getSettings() {
    return this.call<TimesheetSettingsDto | null>(
      "timesheet-settings.curd.getSettings",
      {},
    );
  }

  updateSettings(payload: TimesheetSettingsUpdatePayload) {
    return this.call<TimesheetSettingsDto | null>(
      "timesheet-settings.curd.updateSettings",
      payload,
    );
  }
}

export const timesheetSettingsService = new TimesheetSettingsService();
