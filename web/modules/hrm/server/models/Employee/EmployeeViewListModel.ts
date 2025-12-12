import {
  BaseViewListModel,
  type FilterConditionMap,
} from "@base/server/models/BaseViewListModel";
import type {
  ListParamsRequest,
  ListParamsResponse,
} from "@base/server/models/interfaces/ListInterface";
import type { ParamFilter } from "@base/server/models/interfaces/FilterInterface";
import type { Column } from "drizzle-orm";
import { eq, ilike } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { table_employee } from "../../schemas";
import { table_department } from "../../schemas/department";
import { table_position } from "../../schemas/position";

const department = alias(table_department, "department");
const position = alias(table_position, "position");

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
  typeof table_employee,
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
      ["id", { column: table_employee.id, sort: true }],
      ["employeeCode", { column: table_employee.employeeCode, sort: true }],
      ["fullName", { column: table_employee.fullName, sort: true }],
      ["email", { column: table_employee.email, sort: true }],
      ["phone", { column: table_employee.phone, sort: true }],
      ["positionId", { column: table_employee.positionId, sort: true }],
      ["departmentId", { column: table_employee.departmentId, sort: true }],
      ["employmentStatus", { column: table_employee.employmentStatus, sort: true }],
      ["hireDate", { column: table_employee.hireDate, sort: true }],
      ["baseSalary", { column: table_employee.baseSalary, sort: true }],
      ["isActive", { column: table_employee.isActive, sort: true }],
      ["createdAt", { column: table_employee.createdAt, sort: true }],
      ["updatedAt", { column: table_employee.updatedAt, sort: true }],
    ]);

  constructor() {
    super({ table: table_employee });
  }

  protected declarationSearch = () =>
    new Map([
      ["employeeCode", (text: string) => ilike(table_employee.employeeCode, text)],
      ["fullName", (text: string) => ilike(table_employee.fullName, text)],
      ["email", (text: string) => ilike(table_employee.email, text)],
    ]);

  protected declarationFilter = (): FilterConditionMap<ParamFilter> =>
    new Map() as FilterConditionMap<ParamFilter>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    params: ListParamsRequest
  ): Promise<ListParamsResponse<EmployeeRow>> => {
    return this.buildQueryDataList(params, (query) =>
      query
        .leftJoin(position, eq(this.table.positionId, position.id))
        .leftJoin(department, eq(this.table.departmentId, department.id))
    );
  };
}

export default EmployeeViewListModel;

