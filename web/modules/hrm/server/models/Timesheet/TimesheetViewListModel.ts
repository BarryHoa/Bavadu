import type { ParamFilter } from "@base/shared/interface/FilterInterface";
import type {
  ListParamsRequest,
  ListParamsResponse,
} from "@base/shared/interface/ListInterface";
import type { Column } from "drizzle-orm";

import { eq, ilike } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { PermissionRequired } from "@base/server/models/BaseModel";
import {
  BaseViewListModel,
  type FilterConditionMap,
} from "@base/server/models/BaseViewListModel";
import { base_tb_users } from "@base/server/schemas/base.user";

import { hrm_tb_timesheets } from "../../schemas";
import { hrm_tb_employees } from "../../schemas/hrm.employee";
import { hrm_tb_shifts } from "../../schemas/hrm.shift";
import { fullNameSqlFrom } from "../Employee/employee.helpers";

const employee = alias(hrm_tb_employees, "employee");
const shift = alias(hrm_tb_shifts, "shift");
const user = alias(base_tb_users, "user");

export interface TimesheetRow {
  id: string;
  userId: string;
  employeeId?: string;
  employee?: {
    id: string;
    employeeCode?: string;
    fullName?: unknown;
  } | null;
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
  status: string;
  createdAt?: number;
  updatedAt?: number;
}

class TimesheetViewListModel extends BaseViewListModel<
  typeof hrm_tb_timesheets,
  TimesheetRow
> {
  protected declarationColumns = () =>
    new Map<
      string,
      {
        column: Column<any>;
        sort?: boolean;
      }
    >([
      ["id", { column: hrm_tb_timesheets.id, sort: true }],
      ["userId", { column: hrm_tb_timesheets.userId, sort: true }],
      ["workDate", { column: hrm_tb_timesheets.workDate, sort: true }],
      ["shiftId", { column: hrm_tb_timesheets.shiftId, sort: true }],
      ["checkInTime", { column: hrm_tb_timesheets.checkInTime, sort: true }],
      ["checkOutTime", { column: hrm_tb_timesheets.checkOutTime, sort: true }],
      ["actualHours", { column: hrm_tb_timesheets.actualHours, sort: true }],
      ["status", { column: hrm_tb_timesheets.status, sort: true }],
      ["createdAt", { column: hrm_tb_timesheets.createdAt, sort: true }],
      ["updatedAt", { column: hrm_tb_timesheets.updatedAt, sort: true }],
    ]);

  constructor() {
    super({ table: hrm_tb_timesheets });
  }

  protected declarationSearch = () =>
    new Map([
      ["employeeCode", (text: string) => ilike(employee.code, text)],
      ["fullName", (text: string) => ilike(fullNameSqlFrom(user), text)],
    ]);

  protected declarationFilter = (): FilterConditionMap<ParamFilter> =>
    new Map() as FilterConditionMap<ParamFilter>;

  protected declarationMappingData = (row: any): TimesheetRow => ({
    id: row.id,
    userId: row.userId,
    employeeId: row.employeeId ?? undefined,
    employee: row.userId
      ? {
          id: row.userId,
          employeeCode: row.employeeCode ?? undefined,
          fullName: row.userFullName ?? undefined,
        }
      : null,
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
    status: row.status,
    createdAt: row.createdAt?.getTime(),
    updatedAt: row.updatedAt?.getTime(),
  });

  @PermissionRequired({ auth: true, permissions: ["hrm.timesheet.view"] })
  getData = async (
    params: ListParamsRequest,
  ): Promise<ListParamsResponse<TimesheetRow>> => {
    const selectColumns = {
      id: hrm_tb_timesheets.id,
      userId: hrm_tb_timesheets.userId,
      employeeId: employee.id,
      workDate: hrm_tb_timesheets.workDate,
      shiftId: hrm_tb_timesheets.shiftId,
      shiftName: shift.name,
      checkInTime: hrm_tb_timesheets.checkInTime,
      checkOutTime: hrm_tb_timesheets.checkOutTime,
      actualHours: hrm_tb_timesheets.actualHours,
      regularHours: hrm_tb_timesheets.regularHours,
      overtimeHours: hrm_tb_timesheets.overtimeHours,
      status: hrm_tb_timesheets.status,
      createdAt: hrm_tb_timesheets.createdAt,
      updatedAt: hrm_tb_timesheets.updatedAt,
      userFullName: fullNameSqlFrom(user).as("userFullName"),
      employeeCode: employee.code,
    };
    return this.buildQueryDataListWithSelect(
      params,
      selectColumns as unknown as Record<string, Column>,
      (query) =>
        query
          .leftJoin(user, eq(this.table.userId, user.id))
          .leftJoin(employee, eq(employee.userId, this.table.userId))
          .leftJoin(shift, eq(this.table.shiftId, shift.id)),
    ).then((res) => ({
      data: (res?.data ?? []).map((row) => this.declarationMappingData(row)),
      total: res?.total ?? 0,
    }));
  };
}

export default TimesheetViewListModel;
