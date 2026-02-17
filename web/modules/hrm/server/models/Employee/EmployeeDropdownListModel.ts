import type {
  ListParamsRequest,
  ListParamsResponse,
} from "@base/shared/interface/ListInterface";
import type { ParamFilter } from "@base/shared/interface/FilterInterface";
import type { Column } from "drizzle-orm";

import { ilike } from "drizzle-orm";

import {
  BaseViewListModel,
  type FilterConditionMap,
} from "@base/server/models/BaseViewListModel";

import { hrm_tb_employees } from "../../schemas";

export interface EmployeeDropdownRow {
  id: string;
  employeeCode: string;
  fullName?: unknown;
  isActive?: boolean;
}

class EmployeeDropdownListModel extends BaseViewListModel<
  typeof hrm_tb_employees,
  EmployeeDropdownRow
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
      ["isActive", { column: hrm_tb_employees.isActive, sort: true }],
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
    ]);

  protected declarationFilter = (): FilterConditionMap<ParamFilter> =>
    new Map() as FilterConditionMap<ParamFilter>;

  protected declarationMappingData = (row: any): EmployeeDropdownRow => ({
    id: row.id,
    employeeCode: row.employeeCode,
    fullName: row.fullName,
    isActive: row.isActive ?? undefined,
  });

  getData = async (
    params: ListParamsRequest,
  ): Promise<ListParamsResponse<EmployeeDropdownRow>> => {
    return this.buildQueryDataList(params);
  };
}

export default EmployeeDropdownListModel;
