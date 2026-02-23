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

import { base_tb_users } from "@base/server/schemas/base.user";

import { fullNameSqlFrom } from "./employee.helpers";

import { hrm_tb_employees } from "../../schemas";

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
      ["employeeCode", { column: hrm_tb_employees.employeeCode, sort: true }],
      ["isActive", { column: hrm_tb_employees.isActive, sort: true }],
    ]);

  constructor() {
    super({ table: hrm_tb_employees });
  }

  protected declarationSearch = () =>
    new Map([
      ["employeeCode", (t: string) => ilike(hrm_tb_employees.employeeCode, t)],
      ["fullName", (t: string) => ilike(fullNameSql, t)],
    ]);

  protected declarationFilter = (): FilterConditionMap<ParamFilter> =>
    new Map() as FilterConditionMap<ParamFilter>;

  protected declarationMappingData = (row: any): EmployeeDropdownRow => ({
    id: row.id,
    employeeCode: row.employeeCode,
    fullName: row.fullName ?? undefined,
    isActive: row.isActive ?? undefined,
  });

  getData = async (
    params: ListParamsRequest,
  ): Promise<ListParamsResponse<EmployeeDropdownRow>> => {
    const select = {
      id: hrm_tb_employees.id,
      employeeCode: hrm_tb_employees.employeeCode,
      fullName: fullNameSql.as("fullName"),
      isActive: hrm_tb_employees.isActive,
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
