import { eq, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { BaseModel } from "@base/server/models/BaseModel";

import { NewHrmTbLeaveRequest, hrm_tb_leave_requests } from "../../schemas";
import { hrm_tb_employees } from "../../schemas/hrm.employee";
import { hrm_tb_leave_types } from "../../schemas/hrm.leave-type";

const employee = alias(hrm_tb_employees, "employee");
const leaveType = alias(hrm_tb_leave_types, "leave_type");

export interface LeaveRequestRow {
  id: string;
  employeeId: string;
  employee?: {
    id: string;
    employeeCode?: string;
    fullName?: unknown;
  } | null;
  leaveTypeId: string;
  leaveType?: {
    id: string;
    name?: unknown;
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

export interface LeaveRequestInput {
  employeeId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  days: number;
  reason?: string | null;
  status?: string;
  workflowInstanceId?: string | null;
}

export default class LeaveRequestModel extends BaseModel<
  typeof hrm_tb_leave_requests
> {
  constructor() {
    super(hrm_tb_leave_requests);
  }

  getLeaveRequestById = async (id: string): Promise<LeaveRequestRow | null> => {
    const result = await this.db
      .select({
        id: this.table.id,
        employeeId: this.table.employeeId,
        employeeCode: employee.code,
        employeeFullName: sql<string>`''`.as("employeeFullName"),
        leaveTypeId: this.table.leaveTypeId,
        leaveTypeName: leaveType.name,
        startDate: this.table.startDate,
        endDate: this.table.endDate,
        days: this.table.days,
        reason: this.table.reason,
        status: this.table.status,
        workflowInstanceId: this.table.workflowInstanceId,
        approvedBy: this.table.approvedBy,
        approvedAt: this.table.approvedAt,
        rejectedBy: this.table.rejectedBy,
        rejectedAt: this.table.rejectedAt,
        rejectionReason: this.table.rejectionReason,
        createdAt: this.table.createdAt,
        updatedAt: this.table.updatedAt,
      })
      .from(this.table)
      .leftJoin(employee, eq(this.table.employeeId, employee.id))
      .leftJoin(leaveType, eq(this.table.leaveTypeId, leaveType.id))
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
      leaveTypeId: row.leaveTypeId,
      leaveType: row.leaveTypeId
        ? {
            id: row.leaveTypeId,
            name: row.leaveTypeName ?? undefined,
          }
        : null,
      startDate: row.startDate,
      endDate: row.endDate,
      days: row.days,
      reason: row.reason ?? undefined,
      status: row.status,
      workflowInstanceId: row.workflowInstanceId ?? undefined,
      approvedBy: row.approvedBy ?? undefined,
      approvedAt: row.approvedAt?.getTime(),
      rejectedBy: row.rejectedBy ?? undefined,
      rejectedAt: row.rejectedAt?.getTime(),
      rejectionReason: row.rejectionReason ?? undefined,
      createdAt: row.createdAt?.getTime(),
      updatedAt: row.updatedAt?.getTime(),
    };
  };

  getDataById = async (params: {
    id: string;
  }): Promise<LeaveRequestRow | null> => {
    return this.getLeaveRequestById(params.id);
  };

  createLeaveRequest = async (
    payload: LeaveRequestInput,
  ): Promise<LeaveRequestRow> => {
    const now = new Date();
    const insertData: NewHrmTbLeaveRequest = {
      employeeId: payload.employeeId,
      leaveTypeId: payload.leaveTypeId,
      startDate: payload.startDate,
      endDate: payload.endDate,
      days: payload.days,
      reason: payload.reason ?? null,
      status: payload.status ?? "pending",
      workflowInstanceId: payload.workflowInstanceId ?? null,
      createdAt: now,
      updatedAt: now,
    };

    const [created] = await this.db
      .insert(this.table)
      .values(insertData)
      .returning({ id: this.table.id });

    if (!created) throw new Error("Failed to create leave request");

    const request = await this.getLeaveRequestById(created.id);

    if (!request)
      throw new Error("Failed to load leave request after creation");

    return request;
  };

  updateLeaveRequest = async (
    id: string,
    payload: Partial<LeaveRequestInput>,
  ): Promise<LeaveRequestRow | null> => {
    const updateData: Partial<typeof this.table.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (payload.employeeId !== undefined)
      updateData.employeeId = payload.employeeId;
    if (payload.leaveTypeId !== undefined)
      updateData.leaveTypeId = payload.leaveTypeId;
    if (payload.startDate !== undefined)
      updateData.startDate = payload.startDate;
    if (payload.endDate !== undefined) updateData.endDate = payload.endDate;
    if (payload.days !== undefined) updateData.days = payload.days;
    if (payload.reason !== undefined)
      updateData.reason = payload.reason ?? null;
    if (payload.status !== undefined) updateData.status = payload.status;
    if (payload.workflowInstanceId !== undefined)
      updateData.workflowInstanceId = payload.workflowInstanceId ?? null;

    await this.db
      .update(this.table)
      .set(updateData)
      .where(eq(this.table.id, id));

    return this.getLeaveRequestById(id);
  };

  updateData = async (params: { id: string; payload: any }) => {
    const { id, payload } = params;
    const normalizedPayload: Partial<LeaveRequestInput> = {};

    if (payload.employeeId !== undefined) {
      normalizedPayload.employeeId = String(payload.employeeId);
    }
    if (payload.leaveTypeId !== undefined) {
      normalizedPayload.leaveTypeId = String(payload.leaveTypeId);
    }
    if (payload.startDate !== undefined) {
      normalizedPayload.startDate = String(payload.startDate);
    }
    if (payload.endDate !== undefined) {
      normalizedPayload.endDate = String(payload.endDate);
    }
    if (payload.days !== undefined) {
      normalizedPayload.days = Number(payload.days);
    }
    if (payload.reason !== undefined) {
      normalizedPayload.reason =
        payload.reason === null || payload.reason === ""
          ? null
          : String(payload.reason);
    }
    if (payload.status !== undefined) {
      normalizedPayload.status = String(payload.status);
    }
    if (payload.workflowInstanceId !== undefined) {
      normalizedPayload.workflowInstanceId =
        payload.workflowInstanceId === null || payload.workflowInstanceId === ""
          ? null
          : String(payload.workflowInstanceId);
    }

    return this.updateLeaveRequest(id, normalizedPayload);
  };
}
