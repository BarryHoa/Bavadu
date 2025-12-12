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

import { table_position } from "../../schemas";
import { table_department } from "../../schemas/department";

const department = alias(table_department, "department");

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
  typeof table_position,
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
      ["id", { column: table_position.id, sort: true }],
      ["code", { column: table_position.code, sort: true }],
      ["name", { column: table_position.name, sort: true }],
      ["description", { column: table_position.description, sort: false }],
      ["departmentId", { column: table_position.departmentId, sort: true }],
      ["jobFamily", { column: table_position.jobFamily, sort: true }],
      ["jobGrade", { column: table_position.jobGrade, sort: true }],
      ["reportsTo", { column: table_position.reportsTo, sort: true }],
      ["minSalary", { column: table_position.minSalary, sort: true }],
      ["maxSalary", { column: table_position.maxSalary, sort: true }],
      ["isActive", { column: table_position.isActive, sort: true }],
      ["createdAt", { column: table_position.createdAt, sort: true }],
      ["updatedAt", { column: table_position.updatedAt, sort: true }],
    ]);

  constructor() {
    super({ table: table_position });
  }

  protected declarationSearch = () =>
    new Map([
      ["code", (text: string) => ilike(table_position.code, text)],
      ["name", (text: string) => ilike(table_position.name, text)],
    ]);

  protected declarationFilter = (): FilterConditionMap<ParamFilter> =>
    new Map() as FilterConditionMap<ParamFilter>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  getData = async (
    params: ListParamsRequest
  ): Promise<ListParamsResponse<PositionRow>> => {
    return this.buildQueryDataList(params, (query) =>
      query.leftJoin(department, eq(this.table.departmentId, department.id))
    );
  };
}

export default PositionViewListModel;

