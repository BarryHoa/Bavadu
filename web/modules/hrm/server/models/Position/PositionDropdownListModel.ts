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

import { hrm_tb_positions } from "../../schemas";
import { hrm_tb_departments } from "../../schemas/hrm.department";

const department = alias(hrm_tb_departments, "department");

export interface PositionDropdownRow {
  id: string;
  code: string;
  name?: unknown;
  departmentId: string;
  department?: {
    id: string;
    name?: unknown;
  } | null;
  isActive?: boolean;
}

class PositionDropdownListModel extends BaseViewListModel<
  typeof hrm_tb_positions,
  PositionDropdownRow
> {
  protected declarationColumns = () =>
    new Map<
      string,
      {
        column: Column<any>;
        sort?: boolean;
      }
    >([
      ["id", { column: hrm_tb_positions.id, sort: true }],
      ["code", { column: hrm_tb_positions.code, sort: true }],
      ["name", { column: hrm_tb_positions.name, sort: true }],
      ["departmentId", { column: hrm_tb_positions.departmentId, sort: true }],
      ["isActive", { column: hrm_tb_positions.isActive, sort: true }],
    ]);

  constructor() {
    super({ table: hrm_tb_positions });
  }

  protected declarationSearch = () =>
    new Map([
      ["code", (text: string) => ilike(hrm_tb_positions.code, text)],
      ["name", (text: string) => ilike(hrm_tb_positions.name, text)],
    ]);

  protected declarationFilter = (): FilterConditionMap<ParamFilter> =>
    new Map() as FilterConditionMap<ParamFilter>;

  protected declarationMappingData = (row: any): PositionDropdownRow => ({
    id: row.id,
    code: row.code,
    name: row.name,
    departmentId: row.departmentId,
    department: row.departmentId
      ? {
          id: row.departmentId,
          name: row.departmentName ?? undefined,
        }
      : null,
    isActive: row.isActive ?? undefined,
  });

  getData = async (
    params: ListParamsRequest,
  ): Promise<ListParamsResponse<PositionDropdownRow>> => {
    return this.buildQueryDataList(params, (query) =>
      query.leftJoin(department, eq(this.table.departmentId, department.id)),
    );
  };
}

export default PositionDropdownListModel;
