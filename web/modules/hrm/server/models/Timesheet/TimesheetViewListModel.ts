import type {
  ListParamsRequest,
  ListParamsResponse,
} from "@base/shared/interface/ListInterface";
import type { ParamFilter } from "@base/shared/interface/FilterInterface";
import type { Column } from "drizzle-orm";

import { eq, ilike, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import {
  BaseViewListModel,
  type FilterConditionMap,
} from "@base/server/models/BaseViewListModel";

import { hrm_tb_timesheets } from "../../schemas";
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
      ["employeeId", { column: hrm_tb_timesheets.employeeId, sort: true }],
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
      ["fullName", (_text: string) => sql`true`],
    ]);

  protected declarationFilter = (): FilterConditionMap<ParamFilter> =>
    new Map() as FilterConditionMap<ParamFilter>;

  protected declarationMappingData = (row: any): TimesheetRow => ({
    id: row.id,
    employeeId: row.employeeId,
    employee: row.employeeId
      ? {
          id: row.employeeId,
          employeeCode: row.employeeCode ?? undefined,
          fullName: row.employeeFullName ?? undefined,
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

  getData = async (
    params: ListParamsRequest,
  ): Promise<ListParamsResponse<TimesheetRow>> => {
    return this.buildQueryDataList(params, (query) =>
      query
        .leftJoin(employee, eq(this.table.employeeId, employee.id))
        .leftJoin(shift, eq(this.table.shiftId, shift.id)),
    );
  };
}

export default TimesheetViewListModel;
