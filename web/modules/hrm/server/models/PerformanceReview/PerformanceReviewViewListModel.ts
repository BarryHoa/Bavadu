import type {
  ListParamsRequest,
  ListParamsResponse,
} from "@base/shared/interface/ListInterface";
import type { ParamFilter } from "@base/shared/interface/FilterInterface";
import type { Column } from "drizzle-orm";

import { eq, ilike, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import {
  BaseViewListModel,
  type FilterConditionMap,
} from "@base/server/models/BaseViewListModel";

import { hrm_tb_performance_reviews } from "../../schemas";
import { hrm_tb_employees } from "../../schemas/hrm.employee";

const employee = alias(hrm_tb_employees, "employee");
const reviewer = alias(hrm_tb_employees, "reviewer");

export interface PerformanceReviewRow {
  id: string;
  employeeId: string;
  employee?: {
    id: string;
    employeeCode?: string;
    fullName?: unknown;
  } | null;
  reviewType: string;
  reviewPeriod?: string | null;
  reviewDate: string;
  reviewerId: string;
  reviewer?: {
    id: string;
    employeeCode?: string;
    fullName?: unknown;
  } | null;
  overallRating?: number | null;
  status: string;
  createdAt?: number;
  updatedAt?: number;
}

class PerformanceReviewViewListModel extends BaseViewListModel<
  typeof hrm_tb_performance_reviews,
  PerformanceReviewRow
> {
  protected declarationColumns = () =>
    new Map<
      string,
      {
        column: Column<any>;
        sort?: boolean;
      }
    >([
      ["id", { column: hrm_tb_performance_reviews.id, sort: true }],
      [
        "employeeId",
        { column: hrm_tb_performance_reviews.employeeId, sort: true },
      ],
      [
        "reviewType",
        { column: hrm_tb_performance_reviews.reviewType, sort: true },
      ],
      [
        "reviewDate",
        { column: hrm_tb_performance_reviews.reviewDate, sort: true },
      ],
      [
        "reviewerId",
        { column: hrm_tb_performance_reviews.reviewerId, sort: true },
      ],
      [
        "overallRating",
        { column: hrm_tb_performance_reviews.overallRating, sort: true },
      ],
      ["status", { column: hrm_tb_performance_reviews.status, sort: true }],
      [
        "createdAt",
        { column: hrm_tb_performance_reviews.createdAt, sort: true },
      ],
      [
        "updatedAt",
        { column: hrm_tb_performance_reviews.updatedAt, sort: true },
      ],
    ]);

  constructor() {
    super({ table: hrm_tb_performance_reviews });
  }

  protected declarationSearch = () =>
    new Map([
      ["employeeCode", (text: string) => ilike(employee.code, text)],
      ["fullName", (_text: string) => sql`true`],
    ]);

  protected declarationFilter = (): FilterConditionMap<ParamFilter> =>
    new Map() as FilterConditionMap<ParamFilter>;

  protected declarationMappingData = (row: any): PerformanceReviewRow => ({
    id: row.id,
    employeeId: row.employeeId,
    employee: row.employeeId
      ? {
          id: row.employeeId,
          employeeCode: row.employeeCode ?? undefined,
          fullName: row.employeeFullName ?? undefined,
        }
      : null,
    reviewType: row.reviewType,
    reviewPeriod: row.reviewPeriod ?? undefined,
    reviewDate: row.reviewDate,
    reviewerId: row.reviewerId,
    reviewer: row.reviewerId
      ? {
          id: row.reviewerId,
          employeeCode: row.reviewerCode ?? undefined,
          fullName: row.reviewerFullName ?? undefined,
        }
      : null,
    overallRating: row.overallRating ?? undefined,
    status: row.status,
    createdAt: row.createdAt?.getTime(),
    updatedAt: row.updatedAt?.getTime(),
  });

  getData = async (
    params: ListParamsRequest,
  ): Promise<ListParamsResponse<PerformanceReviewRow>> => {
    return this.buildQueryDataList(params, (query) =>
      query
        .leftJoin(employee, eq(this.table.employeeId, employee.id))
        .leftJoin(reviewer, eq(this.table.reviewerId, reviewer.id)),
    );
  };
}

export default PerformanceReviewViewListModel;
