import type { LocaleDataType } from "@base/shared/interface/Locale";

export interface TimesheetDto {
  id: string;
  employeeId: string;
  employee?: {
    id: string;
    employeeCode?: string;
    fullName?: LocaleDataType<string>;
  } | null;
  rosterId?: string | null;
  workDate: string;
  shiftId?: string | null;
  shift?: {
    id: string;
    name?: LocaleDataType<string>;
  } | null;
  checkInTime?: number | null;
  checkOutTime?: number | null;
  actualHours?: number | null;
  regularHours?: number | null;
  overtimeHours?: number;
  breakDuration?: number;
  status: string;
  checkInMethod?: string | null;
  checkOutMethod?: string | null;
  checkInLocation?: string | null;
  checkOutLocation?: string | null;
  notes?: string | null;
  approvedBy?: string | null;
  approvedAt?: number | null;
  createdAt?: number;
  updatedAt?: number;
}

export interface CreateTimesheetPayload {
  employeeId: string;
  rosterId?: string | null;
  workDate: string;
  shiftId?: string | null;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  breakDuration?: number;
  status?: string;
  checkInMethod?: string | null;
  checkOutMethod?: string | null;
  checkInLocation?: string | null;
  checkOutLocation?: string | null;
  notes?: string | null;
}

export interface UpdateTimesheetPayload extends Partial<CreateTimesheetPayload> {
  id: string;
}
