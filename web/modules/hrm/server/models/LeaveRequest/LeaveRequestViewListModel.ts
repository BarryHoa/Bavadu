import type {
  ListParamsRequest,
  ListParamsResponse,
} from "@base/shared/interface/ListInterface";
import type { ParamFilter } from "@base/shared/interface/FilterInterface";
import type { Column } from "drizzle-orm";

import {
  BaseViewListModel,
  type FilterConditionMap,
} from "@base/server/models/BaseViewListModel";
import { eq, ilike } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { hrm_tb_leave_requests } from "../../schemas";
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
  status: string;
  createdAt?: number;
  updatedAt?: number;
}

class LeaveRequestViewListModel extends BaseViewListModel<
  typeof hrm_tb_leave_requests,
  LeaveRequestRow
> {
  protected declarationColumns = () =>
    new Map<
      string,
      {
        column: Column<any>;
        sort?: boolean;
      }
    >([
      ["id", { column: hrm_tb_leave_requests.id, sort: true }],
      ["employeeId", { column: hrm_tb_leave_requests.employeeId, sort: true }],
      [
        "leaveTypeId",
        { column: hrm_tb_leave_requests.leaveTypeId, sort: true },
      ],
      ["startDate", { column: hrm_tb_leave_requests.startDate, sort: true }],
      ["endDate", { column: hrm_tb_leave_requests.endDate, sort: true }],
      ["days", { column: hrm_tb_leave_requests.days, sort: true }],
      ["status", { column: hrm_tb_leave_requests.status, sort: true }],
      ["createdAt", { column: hrm_tb_leave_requests.createdAt, sort: true }],
      ["updatedAt", { column: hrm_tb_leave_requests.updatedAt, sort: true }],
    ]);

  constructor() {
    super({ table: hrm_tb_leave_requests });
  }

  protected declarationSearch = () =>
    new Map([
      ["employeeCode", (text: string) => ilike(employee.employeeCode, text)],
      ["fullName", (text: string) => ilike(employee.fullName, text)],
    ]);

  protected declarationFilter = (): FilterConditionMap<ParamFilter> =>
    new Map() as FilterConditionMap<ParamFilter>;

  protected declarationMappingData = (row: any): LeaveRequestRow => ({
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
    status: row.status,
    createdAt: row.createdAt?.getTime(),
    updatedAt: row.updatedAt?.getTime(),
  });

  getData = async (
    params: ListParamsRequest,
  ): Promise<ListParamsResponse<LeaveRequestRow>> => {
    return this.buildQueryDataList(params, (query) =>
      query
        .leftJoin(employee, eq(this.table.employeeId, employee.id))
        .leftJoin(leaveType, eq(this.table.leaveTypeId, leaveType.id)),
    );
  };
}

export default LeaveRequestViewListModel;
