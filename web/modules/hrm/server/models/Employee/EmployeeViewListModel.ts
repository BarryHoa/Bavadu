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

import { fullNameSqlFrom } from "./employee.helpers";

import { hrm_tb_employees } from "../../schemas";
import { hrm_tb_departments } from "../../schemas/hrm.department";
import { hrm_tb_positions } from "../../schemas/hrm.position";

const department = alias(hrm_tb_departments, "department");
const position = alias(hrm_tb_positions, "position");
const employee = alias(hrm_tb_employees, "employee");
const fullNameSql = fullNameSqlFrom(base_tb_users);

export interface EmployeeRow {
  id: string;
  employeeId: string;
  code: string;
  fullName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  emails?: string | null;
  phones?: string | null;
  positionId: string;
  position?: { id: string; name?: unknown } | null;
  departmentId: string;
  department?: { id: string; name?: unknown } | null;
  status: string;
  type?: string | null;
  hireDate?: string | null;
  createdAt?: number;
  updatedAt?: number;
}

class EmployeeViewListModel extends BaseViewListModel<
  typeof base_tb_users,
  EmployeeRow
> {
  protected declarationColumns = () =>
    new Map<string, { column: Column<any>; sort?: boolean }>([
      ["code", { column: employee.code, sort: true }],
      ["type", { column: employee.type, sort: true }],
      ["positionId", { column: employee.positionId, sort: true }],
      ["departmentId", { column: employee.departmentId, sort: true }],
      ["status", { column: employee.status, sort: true }],
      ["hireDate", { column: employee.hireDate, sort: true }],
      ["createdAt", { column: employee.createdAt, sort: true }],
      ["updatedAt", { column: employee.updatedAt, sort: true }],
    ]);

  constructor() {
    super({ table: base_tb_users });
  }

  protected declarationSearch = () =>
    new Map([
      ["code", (t: string) => ilike(employee.code, t)],
      ["fullName", (t: string) => ilike(fullNameSql, t)],
      ["emails", (t: string) => ilike(base_tb_users.emails, t)],
      ["phones", (t: string) => ilike(base_tb_users.phones, t)],
    ]);

  protected declarationFilter = (): FilterConditionMap<ParamFilter> =>
    new Map() as FilterConditionMap<ParamFilter>;

  protected declarationMappingData = (row: any): EmployeeRow => ({
    id: row.id,
    code: row.code,
    employeeId: row.employeeId,
    fullName: row.fullName,
    firstName: row.firstName,
    lastName: row.lastName,
    emails: row.emails,
    phones: row.phones,
    positionId: row.positionId,
    position: row.positionId
      ? { id: row.positionId, name: row.positionName }
      : null,
    departmentId: row.departmentId,
    department: row.departmentId
      ? { id: row.departmentId, name: row.departmentName }
      : null,
    status: row.status,
    type: row.type ?? undefined,
    hireDate: row.hireDate ?? undefined,
    createdAt: row.createdAt?.getTime?.(),
    updatedAt: row.updatedAt?.getTime?.(),
  });

  @PermissionRequired({
    auth: true,
    permissions: ["hrm.employee.view"],
  })
  getData = async (
    params: ListParamsRequest,
  ): Promise<ListParamsResponse<EmployeeRow>> => {
    const select = {
      id: this.table.id,
      employeeId: employee.id,
      code: employee.code,
      fullName: fullNameSql.as("fullName"),
      firstName: this.table.firstName,
      lastName: this.table.lastName,
      emails: this.table.emails,
      phones: this.table.phones,
      positionId: employee.positionId,
      positionName: position.name,
      departmentId: employee.departmentId,
      departmentName: department.name,
      status: employee.status,
      type: employee.type,
      hireDate: employee.hireDate,
      createdAt: employee.createdAt,
      updatedAt: employee.updatedAt,
    };
    const result = await this.buildQueryDataListWithSelect(
      params,
      select as unknown as Record<string, Column>,
      (q) =>
        q
          .leftJoin(employee, eq(employee.userId, base_tb_users.id))
          .leftJoin(position, eq(employee.positionId, position.id))
          .leftJoin(department, eq(employee.departmentId, department.id)),
    );
    return {
      data: (result?.data ?? []).map((row) => this.declarationMappingData(row)),
      total: result?.total ?? 0,
    };
  };
}

export default EmployeeViewListModel;
