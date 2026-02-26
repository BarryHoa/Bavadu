import type { ParamFilter } from "@base/shared/interface/FilterInterface";
import type {
  ListParamsRequest,
  ListParamsResponse,
} from "@base/shared/interface/ListInterface";
import type { Column } from "drizzle-orm";

import { eq, ilike } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import {
  BaseViewListModel,
  type FilterConditionMap,
} from "@base/server/models/BaseViewListModel";
import { base_tb_users } from "@base/server/schemas/base.user";

import { hrm_tb_employees } from "../../schemas";

import { fullNameSqlFrom } from "./employee.helpers";

const user = alias(base_tb_users, "user");
const fullNameSql = fullNameSqlFrom(user);

export interface EmployeeDropdownRow {
  id: string;
  employeeCode: string;
  fullName?: string | null;
  isActive?: boolean;
}

class EmployeeDropdownListModel extends BaseViewListModel<
  typeof hrm_tb_employees,
  EmployeeDropdownRow
> {
  protected declarationColumns = () =>
    new Map<string, { column: Column<any>; sort?: boolean }>([
      ["id", { column: hrm_tb_employees.id, sort: true }],
      ["employeeCode", { column: hrm_tb_employees.code, sort: true }],
      ["status", { column: hrm_tb_employees.status, sort: true }],
    ]);

  constructor() {
    super({ table: hrm_tb_employees });
  }

  protected declarationSearch = () =>
    new Map([
      ["employeeCode", (t: string) => ilike(hrm_tb_employees.code, t)],
      ["fullName", (t: string) => ilike(fullNameSql, t)],
    ]);

  protected declarationFilter = (): FilterConditionMap<ParamFilter> =>
    new Map() as FilterConditionMap<ParamFilter>;

  protected declarationMappingData = (row: any): EmployeeDropdownRow => ({
    id: row.id,
    employeeCode: row.employeeCode ?? row.code,
    fullName: row.fullName ?? undefined,
    isActive: row.status === "active",
  });

  getData = async (
    params: ListParamsRequest,
  ): Promise<ListParamsResponse<EmployeeDropdownRow>> => {
    const select = {
      id: hrm_tb_employees.id,
      employeeCode: hrm_tb_employees.code,
      fullName: fullNameSql.as("fullName"),
      status: hrm_tb_employees.status,
    };
    const result = await this.buildQueryDataListWithSelect(
      params,
      select as unknown as Record<string, Column>,
      (q) => q.leftJoin(user, eq(hrm_tb_employees.userId, user.id)),
    );

    return {
      data: (result?.data ?? []).map((row) => this.declarationMappingData(row)),
      total: result?.total ?? 0,
    };
  };
}

export default EmployeeDropdownListModel;
