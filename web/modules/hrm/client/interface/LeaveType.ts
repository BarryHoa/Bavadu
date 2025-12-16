import type { LocaleDataType } from "@base/server/interfaces/Locale";

export interface LeaveTypeDto {
  id: string;
  code: string;
  name?: LocaleDataType<string>;
  description?: LocaleDataType<string> | null;
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

export interface CreateLeaveTypePayload {
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

export interface UpdateLeaveTypePayload extends Partial<CreateLeaveTypePayload> {
  id: string;
}
