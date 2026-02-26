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

import { hrm_tb_payrolls } from "../../schemas";
import { hrm_tb_employees } from "../../schemas/hrm.employee";
import { hrm_tb_payrolls_period } from "../../schemas/hrm.payroll-period";

const employee = alias(hrm_tb_employees, "employee");
const period = alias(hrm_tb_payrolls_period, "period");

export interface PayrollRow {
  id: string;
  payrollPeriodId: string;
  payrollPeriod?: {
    id: string;
    code?: string;
    name?: string | null;
  } | null;
  employeeId: string;
  employee?: {
    id: string;
    employeeCode?: string;
    fullName?: unknown;
  } | null;
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
  status: string;
  createdAt?: number;
  updatedAt?: number;
}

class PayrollViewListModel extends BaseViewListModel<
  typeof hrm_tb_payrolls,
  PayrollRow
> {
  protected declarationColumns = () =>
    new Map<
      string,
      {
        column: Column<any>;
        sort?: boolean;
      }
    >([
      ["id", { column: hrm_tb_payrolls.id, sort: true }],
      [
        "payrollPeriodId",
        { column: hrm_tb_payrolls.payrollPeriodId, sort: true },
      ],
      ["employeeId", { column: hrm_tb_payrolls.employeeId, sort: true }],
      ["grossSalary", { column: hrm_tb_payrolls.grossSalary, sort: true }],
      [
        "totalDeductions",
        { column: hrm_tb_payrolls.totalDeductions, sort: true },
      ],
      ["netSalary", { column: hrm_tb_payrolls.netSalary, sort: true }],
      ["status", { column: hrm_tb_payrolls.status, sort: true }],
      ["createdAt", { column: hrm_tb_payrolls.createdAt, sort: true }],
      ["updatedAt", { column: hrm_tb_payrolls.updatedAt, sort: true }],
    ]);

  constructor() {
    super({ table: hrm_tb_payrolls });
  }

  protected declarationSearch = () =>
    new Map([
      ["employeeCode", (text: string) => ilike(employee.code, text)],
      ["fullName", (_text: string) => sql`true`],
    ]);

  protected declarationFilter = (): FilterConditionMap<ParamFilter> =>
    new Map() as FilterConditionMap<ParamFilter>;

  protected declarationMappingData = (row: any): PayrollRow => ({
    id: row.id,
    payrollPeriodId: row.payrollPeriodId,
    payrollPeriod: row.payrollPeriodId
      ? {
          id: row.payrollPeriodId,
          code: row.periodCode ?? undefined,
          name: row.periodName ?? undefined,
        }
      : null,
    employeeId: row.employeeId,
    employee: row.employeeId
      ? {
          id: row.employeeId,
          employeeCode: row.employeeCode ?? undefined,
          fullName: row.employeeFullName ?? undefined,
        }
      : null,
    grossSalary: row.grossSalary,
    totalDeductions: row.totalDeductions,
    netSalary: row.netSalary,
    status: row.status,
    createdAt: row.createdAt?.getTime(),
    updatedAt: row.updatedAt?.getTime(),
  });

  getData = async (
    params: ListParamsRequest,
  ): Promise<ListParamsResponse<PayrollRow>> => {
    return this.buildQueryDataList(params, (query) =>
      query
        .leftJoin(employee, eq(this.table.employeeId, employee.id))
        .leftJoin(period, eq(this.table.payrollPeriodId, period.id)),
    );
  };
}

export default PayrollViewListModel;
