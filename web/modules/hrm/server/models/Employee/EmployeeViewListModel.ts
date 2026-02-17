import type {
  ListParamsRequest,
  ListParamsResponse,
} from "@base/shared/interface/ListInterface";
import type { ParamFilter } from "@base/shared/interface/FilterInterface";
import type { Column } from "drizzle-orm";

import { eq, ilike } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import {
  BaseViewListModel,
  type FilterConditionMap,
} from "@base/server/models/BaseViewListModel";

import { hrm_tb_employees } from "../../schemas";
import { hrm_tb_departments } from "../../schemas/hrm.department";
import { hrm_tb_positions } from "../../schemas/hrm.position";

const department = alias(hrm_tb_departments, "department");
const position = alias(hrm_tb_positions, "position");

export interface EmployeeRow {
  id: string;
  employeeCode: string;
  fullName?: unknown;
  email?: string | null;
  phone?: string | null;
  positionId: string;
  position?: {
    id: string;
    name?: unknown;
  } | null;
  departmentId: string;
  department?: {
    id: string;
    name?: unknown;
  } | null;
  employmentStatus: string;
  hireDate: string;
  baseSalary?: number | null;
  isActive?: boolean;
  createdAt?: number;
  updatedAt?: number;
}

class EmployeeViewListModel extends BaseViewListModel<
  typeof hrm_tb_employees,
  EmployeeRow
> {
  protected declarationColumns = () =>
    new Map<
      string,
      {
        column: Column<any>;
        sort?: boolean;
      }
    >([
      ["id", { column: hrm_tb_employees.id, sort: true }],
      ["employeeCode", { column: hrm_tb_employees.employeeCode, sort: true }],
      ["fullName", { column: hrm_tb_employees.fullName, sort: true }],
      ["email", { column: hrm_tb_employees.email, sort: true }],
      ["phone", { column: hrm_tb_employees.phone, sort: true }],
      ["positionId", { column: hrm_tb_employees.positionId, sort: true }],
      ["departmentId", { column: hrm_tb_employees.departmentId, sort: true }],
      [
        "employmentStatus",
        { column: hrm_tb_employees.employmentStatus, sort: true },
      ],
      ["hireDate", { column: hrm_tb_employees.hireDate, sort: true }],
      ["baseSalary", { column: hrm_tb_employees.baseSalary, sort: true }],
      ["isActive", { column: hrm_tb_employees.isActive, sort: true }],
      ["createdAt", { column: hrm_tb_employees.createdAt, sort: true }],
      ["updatedAt", { column: hrm_tb_employees.updatedAt, sort: true }],
    ]);

  constructor() {
    super({ table: hrm_tb_employees });
  }

  protected declarationSearch = () =>
    new Map([
      [
        "employeeCode",
        (text: string) => ilike(hrm_tb_employees.employeeCode, text),
      ],
      ["fullName", (text: string) => ilike(hrm_tb_employees.fullName, text)],
      ["email", (text: string) => ilike(hrm_tb_employees.email, text)],
    ]);

  protected declarationFilter = (): FilterConditionMap<ParamFilter> =>
    new Map() as FilterConditionMap<ParamFilter>;

  protected declarationMappingData = (row: any): EmployeeRow => ({
    id: row.id,
    employeeCode: row.employeeCode,
    fullName: row.fullName,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    positionId: row.positionId,
    position: row.positionId
      ? {
          id: row.positionId,
          name: row.positionName ?? undefined,
        }
      : null,
    departmentId: row.departmentId,
    department: row.departmentId
      ? {
          id: row.departmentId,
          name: row.departmentName ?? undefined,
        }
      : null,
    employmentStatus: row.employmentStatus,
    hireDate: row.hireDate,
    baseSalary: row.baseSalary ?? undefined,
    isActive: row.isActive ?? undefined,
    createdAt: row.createdAt?.getTime(),
    updatedAt: row.updatedAt?.getTime(),
  });

  getData = async (
    params: ListParamsRequest,
  ): Promise<ListParamsResponse<EmployeeRow>> => {
    return this.buildQueryDataList(params, (query) =>
      query
        .leftJoin(position, eq(this.table.positionId, position.id))
        .leftJoin(department, eq(this.table.departmentId, department.id)),
    );
  };
}

export default EmployeeViewListModel;
