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

import { hrm_tb_positions } from "../../schemas";
import { hrm_tb_departments } from "../../schemas/hrm.department";

const department = alias(hrm_tb_departments, "department");

export interface PositionRow {
  id: string;
  code: string;
  name?: unknown;
  description?: unknown;
  departmentId: string;
  department?: {
    id: string;
    name?: unknown;
  } | null;
  jobFamily?: string | null;
  jobGrade?: string | null;
  reportsTo?: string | null;
  minSalary?: number | null;
  maxSalary?: number | null;
  isActive?: boolean;
  createdAt?: number;
  updatedAt?: number;
}

class PositionViewListModel extends BaseViewListModel<
  typeof hrm_tb_positions,
  PositionRow
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
      ["description", { column: hrm_tb_positions.description, sort: false }],
      ["departmentId", { column: hrm_tb_positions.departmentId, sort: true }],
      ["jobFamily", { column: hrm_tb_positions.jobFamily, sort: true }],
      ["jobGrade", { column: hrm_tb_positions.jobGrade, sort: true }],
      ["reportsTo", { column: hrm_tb_positions.reportsTo, sort: true }],
      ["minSalary", { column: hrm_tb_positions.minSalary, sort: true }],
      ["maxSalary", { column: hrm_tb_positions.maxSalary, sort: true }],
      ["isActive", { column: hrm_tb_positions.isActive, sort: true }],
      ["createdAt", { column: hrm_tb_positions.createdAt, sort: true }],
      ["updatedAt", { column: hrm_tb_positions.updatedAt, sort: true }],
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

  protected declarationMappingData = (row: any): PositionRow => ({
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description,
    departmentId: row.departmentId,
    department: row.departmentId
      ? {
          id: row.departmentId,
          name: row.departmentName ?? undefined,
        }
      : null,
    jobFamily: row.jobFamily ?? undefined,
    jobGrade: row.jobGrade ?? undefined,
    reportsTo: row.reportsTo ?? undefined,
    minSalary: row.minSalary ?? undefined,
    maxSalary: row.maxSalary ?? undefined,
    isActive: row.isActive ?? undefined,
    createdAt: row.createdAt?.getTime(),
    updatedAt: row.updatedAt?.getTime(),
  });

  @BaseViewListModel.Auth({ required: true, permissions: ["hrm.position.view"] })
  getData = async (
    params: ListParamsRequest,
  ): Promise<ListParamsResponse<PositionRow>> => {
    return this.buildQueryDataList(params, (query) =>
      query.leftJoin(department, eq(this.table.departmentId, department.id)),
    );
  };
}

export default PositionViewListModel;
