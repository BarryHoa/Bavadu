import type { LocaleDataType } from "@base/server/interfaces/Locale";

export interface LeaveRequestDto {
  id: string;
  employeeId: string;
  employee?: {
    id: string;
    employeeCode?: string;
    fullName?: LocaleDataType<string>;
  } | null;
  leaveTypeId: string;
  leaveType?: {
    id: string;
    name?: LocaleDataType<string>;
  } | null;
  startDate: string;
  endDate: string;
  days: number;
  reason?: string | null;
  status: string;
  workflowInstanceId?: string | null;
  approvedBy?: string | null;
  approvedAt?: number | null;
  rejectedBy?: string | null;
  rejectedAt?: number | null;
  rejectionReason?: string | null;
  createdAt?: number;
  updatedAt?: number;
}

export interface CreateLeaveRequestPayload {
  employeeId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  days: number;
  reason?: string | null;
  status?: string;
  workflowInstanceId?: string | null;
}

export interface UpdateLeaveRequestPayload extends Partial<CreateLeaveRequestPayload> {
  id: string;
}
