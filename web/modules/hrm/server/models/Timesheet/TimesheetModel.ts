import { BaseModel } from "@base/server/models/BaseModel";
import { JsonRpcError, JSON_RPC_ERROR_CODES } from "@base/server/rpc/jsonRpcHandler";
import UserPermissionModel from "@base/server/models/UserPermission/UserPermissionModel";
import { and, eq, gte, lte } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type { NextRequest } from "next/server";

import EmployeeModel from "../Employee/EmployeeModel";
import { NewHrmTbTimesheet, hrm_tb_timesheets } from "../../schemas";
import { hrm_tb_employees } from "../../schemas/hrm.employee";
import { hrm_tb_shifts } from "../../schemas/hrm.shift";

const employee = alias(hrm_tb_employees, "employee");
const shift = alias(hrm_tb_shifts, "shift");

export interface TimesheetRow {
  id: string;
  employeeId: string;
  employee?: {
    id: string;
    employeeCode?: string;
    fullName?: unknown;
  } | null;
  rosterId?: string | null;
  workDate: string;
  shiftId?: string | null;
  shift?: {
    id: string;
    name?: unknown;
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

export interface TimesheetInput {
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

export default class TimesheetModel extends BaseModel<
  typeof hrm_tb_timesheets
> {
  constructor() {
    super(hrm_tb_timesheets);
  }

  private selectJoined = () => ({
    id: this.table.id,
    employeeId: this.table.employeeId,
    employeeCode: employee.employeeCode,
    employeeFullName: employee.fullName,
    rosterId: this.table.rosterId,
    workDate: this.table.workDate,
    shiftId: this.table.shiftId,
    shiftName: shift.name,
    checkInTime: this.table.checkInTime,
    checkOutTime: this.table.checkOutTime,
    actualHours: this.table.actualHours,
    regularHours: this.table.regularHours,
    overtimeHours: this.table.overtimeHours,
    breakDuration: this.table.breakDuration,
    status: this.table.status,
    checkInMethod: this.table.checkInMethod,
    checkOutMethod: this.table.checkOutMethod,
    checkInLocation: this.table.checkInLocation,
    checkOutLocation: this.table.checkOutLocation,
    notes: this.table.notes,
    approvedBy: this.table.approvedBy,
    approvedAt: this.table.approvedAt,
    createdAt: this.table.createdAt,
    updatedAt: this.table.updatedAt,
  });

  private mapJoinedRow = (row: any): TimesheetRow => ({
    id: row.id,
    employeeId: row.employeeId,
    employee: row.employeeId
      ? {
          id: row.employeeId,
          employeeCode: row.employeeCode ?? undefined,
          fullName: row.employeeFullName ?? undefined,
        }
      : null,
    rosterId: row.rosterId ?? undefined,
    workDate: row.workDate,
    shiftId: row.shiftId ?? undefined,
    shift: row.shiftId
      ? {
          id: row.shiftId,
          name: row.shiftName ?? undefined,
        }
      : null,
    checkInTime: row.checkInTime?.getTime(),
    checkOutTime: row.checkOutTime?.getTime(),
    actualHours: row.actualHours ?? undefined,
    regularHours: row.regularHours ?? undefined,
    overtimeHours: row.overtimeHours ?? undefined,
    breakDuration: row.breakDuration ?? undefined,
    status: row.status,
    checkInMethod: row.checkInMethod ?? undefined,
    checkOutMethod: row.checkOutMethod ?? undefined,
    checkInLocation: row.checkInLocation ?? undefined,
    checkOutLocation: row.checkOutLocation ?? undefined,
    notes: row.notes ?? undefined,
    approvedBy: row.approvedBy ?? undefined,
    approvedAt: row.approvedAt?.getTime(),
    createdAt: row.createdAt?.getTime(),
    updatedAt: row.updatedAt?.getTime(),
  });

  getTimesheetById = async (id: string): Promise<TimesheetRow | null> => {
    const result = await this.db
      .select(this.selectJoined())
      .from(this.table)
      .leftJoin(employee, eq(this.table.employeeId, employee.id))
      .leftJoin(shift, eq(this.table.shiftId, shift.id))
      .where(eq(this.table.id, id))
      .limit(1);

    const row = result[0];

    if (!row) return null;

    return this.mapJoinedRow(row);
  };

  getById = async (params: { id: string }): Promise<TimesheetRow | null> => {
    return this.getTimesheetById(params.id);
  };

  /**
   * Get timesheets for a given month, optionally filtered by employee.
   * Params: { year, month, employeeId? }.
   * - If employeeId is omitted: returns current user's timesheets (resolved via session).
   * - If employeeId is provided for another employee: requires hrm.timesheet.viewAll.
   */
  getTimesheetsByMonth = async (
    params: {
    year: number;
    month: number;
    employeeId?: string | null;
  },
    request?: NextRequest,
  ): Promise<{ data: TimesheetRow[] }> => {
    const { year, month } = params;

    const userId = request?.headers.get("x-user-id") ?? null;
    if (!userId) {
      throw new JsonRpcError(
        JSON_RPC_ERROR_CODES.AUTHENTICATION_ERROR,
        "Authentication required",
      );
    }

    const permModel = new UserPermissionModel();
    const perms = await permModel.getPermissionsByUser(userId);
    const hasViewAll = perms.permissions.has("hrm.timesheet.viewAll");

    const employeeModel = new EmployeeModel();
    const currentEmp = await employeeModel.getByUserId({ userId });
    if (!currentEmp) {
      throw new JsonRpcError(
        JSON_RPC_ERROR_CODES.AUTHORIZATION_ERROR,
        "No employee linked to user",
      );
    }

    let employeeId = params.employeeId ?? null;
    if (employeeId && employeeId !== currentEmp.id && !hasViewAll) {
      throw new JsonRpcError(
        JSON_RPC_ERROR_CODES.AUTHORIZATION_ERROR,
        "Missing permission: hrm.timesheet.viewAll",
      );
    }
    if (!employeeId) {
      employeeId = currentEmp.id;
    }

    const firstDay = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDate = new Date(year, month, 0);
    const lastDay = lastDate.toISOString().slice(0, 10);

    const conditions = [
      gte(this.table.workDate, firstDay),
      lte(this.table.workDate, lastDay),
    ];
    conditions.push(eq(this.table.employeeId, employeeId));

    const result = await this.db
      .select(this.selectJoined())
      .from(this.table)
      .leftJoin(employee, eq(this.table.employeeId, employee.id))
      .leftJoin(shift, eq(this.table.shiftId, shift.id))
      .where(and(...conditions))
      .orderBy(this.table.workDate);

    const data: TimesheetRow[] = result.map(this.mapJoinedRow);

    return { data };
  };

  createTimesheet = async (payload: TimesheetInput): Promise<TimesheetRow> => {
    const now = new Date();
    const checkInTime = payload.checkInTime
      ? new Date(payload.checkInTime)
      : null;
    const checkOutTime = payload.checkOutTime
      ? new Date(payload.checkOutTime)
      : null;

    // Calculate hours if both check in/out are provided
    let actualHours: number | null = null;
    let regularHours: number | null = null;
    let overtimeHours = 0;

    if (checkInTime && checkOutTime) {
      const diffMs = checkOutTime.getTime() - checkInTime.getTime();
      const diffHours =
        diffMs / (1000 * 60 * 60) - (payload.breakDuration ?? 0) / 60;

      actualHours = Math.max(0, Math.round(diffHours * 100) / 100);
      // TODO: Calculate regular vs OT based on shift rules
      regularHours = actualHours;
    }

    const insertData: NewHrmTbTimesheet = {
      employeeId: payload.employeeId,
      rosterId: payload.rosterId ?? null,
      workDate: payload.workDate,
      shiftId: payload.shiftId ?? null,
      checkInTime: checkInTime,
      checkOutTime: checkOutTime,
      actualHours: actualHours,
      regularHours: regularHours,
      overtimeHours: overtimeHours,
      breakDuration: payload.breakDuration ?? 0,
      status: payload.status ?? "pending",
      checkInMethod: payload.checkInMethod ?? null,
      checkOutMethod: payload.checkOutMethod ?? null,
      checkInLocation: payload.checkInLocation ?? null,
      checkOutLocation: payload.checkOutLocation ?? null,
      notes: payload.notes ?? null,
      createdAt: now,
      updatedAt: now,
    };

    const [created] = await this.db
      .insert(this.table)
      .values(insertData)
      .returning({ id: this.table.id });

    if (!created) throw new Error("Failed to create timesheet");

    const timesheet = await this.getTimesheetById(created.id);

    if (!timesheet) throw new Error("Failed to load timesheet after creation");

    return timesheet;
  };

  updateTimesheet = async (
    id: string,
    payload: Partial<TimesheetInput>,
  ): Promise<TimesheetRow | null> => {
    const updateData: Partial<typeof this.table.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (payload.employeeId !== undefined)
      updateData.employeeId = payload.employeeId;
    if (payload.rosterId !== undefined)
      updateData.rosterId = payload.rosterId ?? null;
    if (payload.workDate !== undefined) updateData.workDate = payload.workDate;
    if (payload.shiftId !== undefined)
      updateData.shiftId = payload.shiftId ?? null;
    if (payload.checkInTime !== undefined)
      updateData.checkInTime = payload.checkInTime
        ? new Date(payload.checkInTime)
        : null;
    if (payload.checkOutTime !== undefined)
      updateData.checkOutTime = payload.checkOutTime
        ? new Date(payload.checkOutTime)
        : null;
    if (payload.breakDuration !== undefined)
      updateData.breakDuration = payload.breakDuration;
    if (payload.status !== undefined) updateData.status = payload.status;
    if (payload.checkInMethod !== undefined)
      updateData.checkInMethod = payload.checkInMethod ?? null;
    if (payload.checkOutMethod !== undefined)
      updateData.checkOutMethod = payload.checkOutMethod ?? null;
    if (payload.checkInLocation !== undefined)
      updateData.checkInLocation = payload.checkInLocation ?? null;
    if (payload.checkOutLocation !== undefined)
      updateData.checkOutLocation = payload.checkOutLocation ?? null;
    if (payload.notes !== undefined) updateData.notes = payload.notes ?? null;

    // Recalculate hours if times updated
    if (
      payload.checkInTime !== undefined ||
      payload.checkOutTime !== undefined
    ) {
      const existing = await this.getTimesheetById(id);

      if (existing) {
        const checkIn =
          updateData.checkInTime ??
          (existing.checkInTime ? new Date(existing.checkInTime) : null);
        const checkOut =
          updateData.checkOutTime ??
          (existing.checkOutTime ? new Date(existing.checkOutTime) : null);

        if (checkIn && checkOut) {
          const diffMs = checkOut.getTime() - checkIn.getTime();
          const breakMins =
            updateData.breakDuration ?? existing.breakDuration ?? 0;
          const diffHours = diffMs / (1000 * 60 * 60) - breakMins / 60;

          updateData.actualHours = Math.max(
            0,
            Math.round(diffHours * 100) / 100,
          );
          updateData.regularHours = updateData.actualHours;
        }
      }
    }

    await this.db
      .update(this.table)
      .set(updateData)
      .where(eq(this.table.id, id));

    return this.getTimesheetById(id);
  };

  updateData = async (params: { id: string; payload: any }) => {
    const { id, payload } = params;
    const normalizedPayload: Partial<TimesheetInput> = {};

    if (payload.employeeId !== undefined) {
      normalizedPayload.employeeId = String(payload.employeeId);
    }
    if (payload.rosterId !== undefined) {
      normalizedPayload.rosterId =
        payload.rosterId === null || payload.rosterId === ""
          ? null
          : String(payload.rosterId);
    }
    if (payload.workDate !== undefined) {
      normalizedPayload.workDate = String(payload.workDate);
    }
    if (payload.shiftId !== undefined) {
      normalizedPayload.shiftId =
        payload.shiftId === null || payload.shiftId === ""
          ? null
          : String(payload.shiftId);
    }
    if (payload.checkInTime !== undefined) {
      normalizedPayload.checkInTime =
        payload.checkInTime === null || payload.checkInTime === ""
          ? null
          : String(payload.checkInTime);
    }
    if (payload.checkOutTime !== undefined) {
      normalizedPayload.checkOutTime =
        payload.checkOutTime === null || payload.checkOutTime === ""
          ? null
          : String(payload.checkOutTime);
    }
    if (payload.breakDuration !== undefined) {
      normalizedPayload.breakDuration = Number(payload.breakDuration);
    }
    if (payload.status !== undefined) {
      normalizedPayload.status = String(payload.status);
    }
    if (payload.checkInMethod !== undefined) {
      normalizedPayload.checkInMethod =
        payload.checkInMethod === null || payload.checkInMethod === ""
          ? null
          : String(payload.checkInMethod);
    }
    if (payload.checkOutMethod !== undefined) {
      normalizedPayload.checkOutMethod =
        payload.checkOutMethod === null || payload.checkOutMethod === ""
          ? null
          : String(payload.checkOutMethod);
    }
    if (payload.checkInLocation !== undefined) {
      normalizedPayload.checkInLocation =
        payload.checkInLocation === null || payload.checkInLocation === ""
          ? null
          : String(payload.checkInLocation);
    }
    if (payload.checkOutLocation !== undefined) {
      normalizedPayload.checkOutLocation =
        payload.checkOutLocation === null || payload.checkOutLocation === ""
          ? null
          : String(payload.checkOutLocation);
    }
    if (payload.notes !== undefined) {
      normalizedPayload.notes =
        payload.notes === null || payload.notes === ""
          ? null
          : String(payload.notes);
    }

    return this.updateTimesheet(id, normalizedPayload);
  };
}
