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

import { hrm_tb_departments } from "../../schemas";

const parentDepartment = alias(hrm_tb_departments, "parent_department");

export interface DepartmentRow {
  id: string;
  code: string;
  name?: unknown;
  description?: unknown;
  level?: number;
  isActive?: boolean;
  parent?: {
    id: string;
    name?: unknown;
  } | null;
  managerId?: string | null;
  locationId?: string | null;
  createdAt?: number;
  updatedAt?: number;
}

class DepartmentViewListModel extends BaseViewListModel<
  typeof hrm_tb_departments,
  DepartmentRow
> {
  protected declarationColumns = () =>
    new Map<
      string,
      {
        column: Column<any>;
        sort?: boolean;
      }
    >([
      ["id", { column: hrm_tb_departments.id, sort: true }],
      ["code", { column: hrm_tb_departments.code, sort: true }],
      ["name", { column: hrm_tb_departments.name, sort: true }],
      ["description", { column: hrm_tb_departments.description, sort: false }],
      ["level", { column: hrm_tb_departments.level, sort: true }],
      ["isActive", { column: hrm_tb_departments.isActive, sort: true }],
      ["parentId", { column: hrm_tb_departments.parentId, sort: true }],
      ["managerId", { column: hrm_tb_departments.managerId, sort: true }],
      ["locationId", { column: hrm_tb_departments.locationId, sort: true }],
      ["createdAt", { column: hrm_tb_departments.createdAt, sort: true }],
      ["updatedAt", { column: hrm_tb_departments.updatedAt, sort: true }],
    ]);

  constructor() {
    super({ table: hrm_tb_departments });
  }

  protected declarationSearch = () =>
    new Map([
      ["code", (text: string) => ilike(hrm_tb_departments.code, text)],
      ["name", (text: string) => ilike(hrm_tb_departments.name, text)],
    ]);

  protected declarationFilter = (): FilterConditionMap<ParamFilter> =>
    new Map() as FilterConditionMap<ParamFilter>;

  protected declarationMappingData = (row: any): DepartmentRow => ({
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description,
    level: row.level ?? undefined,
    isActive: row.isActive ?? undefined,
    parent: row.parentId
      ? {
          id: row.parentId,
          name: row.parentName ?? undefined,
        }
      : null,
    managerId: row.managerId ?? undefined,
    locationId: row.locationId ?? undefined,
    createdAt: row.createdAt?.getTime(),
    updatedAt: row.updatedAt?.getTime(),
  });

  @BaseViewListModel.Auth({ required: true, permissions: ["hrm.department.view"] })
  getData = async (
    params: ListParamsRequest,
  ): Promise<ListParamsResponse<DepartmentRow>> => {
    return this.buildQueryDataList(params, (query) =>
      query.leftJoin(
        parentDepartment,
        eq(this.table.parentId, parentDepartment.id),
      ),
    );
  };
}

export default DepartmentViewListModel;
