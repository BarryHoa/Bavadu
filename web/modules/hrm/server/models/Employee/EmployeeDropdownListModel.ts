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
import { ilike } from "drizzle-orm";

import { table_employee } from "../../schemas";

export interface EmployeeDropdownRow {
  id: string;
  employeeCode: string;
  fullName?: unknown;
  isActive?: boolean;
}

class EmployeeDropdownListModel extends BaseViewListModel<
  typeof table_employee,
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
      ["id", { column: table_employee.id, sort: true }],
      ["employeeCode", { column: table_employee.employeeCode, sort: true }],
      ["fullName", { column: table_employee.fullName, sort: true }],
      ["isActive", { column: table_employee.isActive, sort: true }],
    ]);

  constructor() {
    super({ table: table_employee });
  }

  protected declarationSearch = () =>
    new Map([
      ["employeeCode", (text: string) => ilike(table_employee.employeeCode, text)],
      ["fullName", (text: string) => ilike(table_employee.fullName, text)],
    ]);

  protected declarationFilter = (): FilterConditionMap<ParamFilter> =>
    new Map() as FilterConditionMap<ParamFilter>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected declarationMappingData = (row: any): EmployeeDropdownRow => ({
    id: row.id,
    employeeCode: row.employeeCode,
    fullName: row.fullName,
    isActive: row.isActive ?? undefined,
  });

  getData = async (
    params: ListParamsRequest
  ): Promise<ListParamsResponse<EmployeeDropdownRow>> => {
    return this.buildQueryDataList(params);
  };
}

export default EmployeeDropdownListModel;

