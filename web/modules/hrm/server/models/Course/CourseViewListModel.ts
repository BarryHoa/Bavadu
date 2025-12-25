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
import { ilike } from "drizzle-orm";

import { hrm_tb_courses } from "../../schemas";

export interface CourseRow {
  id: string;
  code: string;
  name?: unknown;
  category?: string | null;
  duration?: number | null;
  format?: string | null;
  isActive?: boolean;
  createdAt?: number;
  updatedAt?: number;
}

class CourseViewListModel extends BaseViewListModel<
  typeof hrm_tb_courses,
  CourseRow
> {
  protected declarationColumns = () =>
    new Map<
      string,
      {
        column: Column<any>;
        sort?: boolean;
      }
    >([
      ["id", { column: hrm_tb_courses.id, sort: true }],
      ["code", { column: hrm_tb_courses.code, sort: true }],
      ["name", { column: hrm_tb_courses.name, sort: true }],
      ["category", { column: hrm_tb_courses.category, sort: true }],
      ["duration", { column: hrm_tb_courses.duration, sort: true }],
      ["isActive", { column: hrm_tb_courses.isActive, sort: true }],
      ["createdAt", { column: hrm_tb_courses.createdAt, sort: true }],
      ["updatedAt", { column: hrm_tb_courses.updatedAt, sort: true }],
    ]);

  constructor() {
    super({ table: hrm_tb_courses });
  }

  protected declarationSearch = () =>
    new Map([
      ["code", (text: string) => ilike(hrm_tb_courses.code, text)],
      ["name", (text: string) => ilike(hrm_tb_courses.name, text)],
    ]);

  protected declarationFilter = (): FilterConditionMap<ParamFilter> =>
    new Map() as FilterConditionMap<ParamFilter>;

  protected declarationMappingData = (row: any): CourseRow => ({
    id: row.id,
    code: row.code,
    name: row.name,
    category: row.category ?? undefined,
    duration: row.duration ?? undefined,
    format: row.format ?? undefined,
    isActive: row.isActive ?? undefined,
    createdAt: row.createdAt?.getTime(),
    updatedAt: row.updatedAt?.getTime(),
  });

  getData = async (
    params: ListParamsRequest,
  ): Promise<ListParamsResponse<CourseRow>> => {
    return this.buildQueryDataList(params);
  };
}

export default CourseViewListModel;
