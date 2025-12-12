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

import { table_department } from "../../schemas";

const parentDepartment = alias(table_department, "parent_department");

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
  typeof table_department,
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
      ["id", { column: table_department.id, sort: true }],
      ["code", { column: table_department.code, sort: true }],
      ["name", { column: table_department.name, sort: true }],
      [
        "description",
        { column: table_department.description, sort: false },
      ],
      ["level", { column: table_department.level, sort: true }],
      ["isActive", { column: table_department.isActive, sort: true }],
      ["parentId", { column: table_department.parentId, sort: true }],
      ["managerId", { column: table_department.managerId, sort: true }],
      ["locationId", { column: table_department.locationId, sort: true }],
      ["createdAt", { column: table_department.createdAt, sort: true }],
      ["updatedAt", { column: table_department.updatedAt, sort: true }],
    ]);

  constructor() {
    super({ table: table_department });
  }

  protected declarationSearch = () =>
    new Map([
      ["code", (text: string) => ilike(table_department.code, text)],
      ["name", (text: string) => ilike(table_department.name, text)],
    ]);

  protected declarationFilter = (): FilterConditionMap<ParamFilter> =>
    new Map() as FilterConditionMap<ParamFilter>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  getData = async (
    params: ListParamsRequest
  ): Promise<ListParamsResponse<DepartmentRow>> => {
    return this.buildQueryDataList(params, (query) =>
      query.leftJoin(
        parentDepartment,
        eq(this.table.parentId, parentDepartment.id)
      )
    );
  };
}

export default DepartmentViewListModel;

