import type {
  ListParamsRequest,
  ListParamsResponse,
} from "@base/server/models/interfaces/ListInterface";
import type { ParamFilter } from "@base/server/models/interfaces/FilterInterface";
import type { Column } from "drizzle-orm";

import {
  BaseViewListModel,
  type FilterConditionMap,
} from "@base/server/models/BaseViewListModel";
import { eq, ilike } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { hrm_tb_candidates } from "../../schemas";
import { hrm_tb_job_requisitions } from "../../schemas/hrm.job-requisition";

const requisition = alias(hrm_tb_job_requisitions, "requisition");

export interface CandidateRow {
  id: string;
  requisitionId: string;
  requisition?: {
    id: string;
    requisitionNumber?: string;
    title?: unknown;
  } | null;
  fullName?: unknown;
  email?: string | null;
  phone?: string | null;
  status: string;
  stage?: string | null;
  rating?: number | null;
  appliedDate?: number | null;
  createdAt?: number;
  updatedAt?: number;
}

class CandidateViewListModel extends BaseViewListModel<
  typeof hrm_tb_candidates,
  CandidateRow
> {
  protected declarationColumns = () =>
    new Map<
      string,
      {
        column: Column<any>;
        sort?: boolean;
      }
    >([
      ["id", { column: hrm_tb_candidates.id, sort: true }],
      [
        "requisitionId",
        { column: hrm_tb_candidates.requisitionId, sort: true },
      ],
      ["fullName", { column: hrm_tb_candidates.fullName, sort: true }],
      ["email", { column: hrm_tb_candidates.email, sort: true }],
      ["phone", { column: hrm_tb_candidates.phone, sort: true }],
      ["status", { column: hrm_tb_candidates.status, sort: true }],
      ["stage", { column: hrm_tb_candidates.stage, sort: true }],
      ["rating", { column: hrm_tb_candidates.rating, sort: true }],
      ["appliedDate", { column: hrm_tb_candidates.appliedDate, sort: true }],
      ["createdAt", { column: hrm_tb_candidates.createdAt, sort: true }],
      ["updatedAt", { column: hrm_tb_candidates.updatedAt, sort: true }],
    ]);

  constructor() {
    super({ table: hrm_tb_candidates });
  }

  protected declarationSearch = () =>
    new Map([
      ["fullName", (text: string) => ilike(hrm_tb_candidates.fullName, text)],
      ["email", (text: string) => ilike(hrm_tb_candidates.email, text)],
      ["phone", (text: string) => ilike(hrm_tb_candidates.phone, text)],
      [
        "requisitionNumber",
        (text: string) => ilike(requisition.requisitionNumber, text),
      ],
    ]);

  protected declarationFilter = (): FilterConditionMap<ParamFilter> =>
    new Map() as FilterConditionMap<ParamFilter>;

  protected declarationMappingData = (row: any): CandidateRow => ({
    id: row.id,
    requisitionId: row.requisitionId,
    requisition: row.requisitionId
      ? {
          id: row.requisitionId,
          requisitionNumber: row.requisitionNumber ?? undefined,
          title: row.requisitionTitle ?? undefined,
        }
      : null,
    fullName: row.fullName,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    status: row.status,
    stage: row.stage ?? undefined,
    rating: row.rating ?? undefined,
    appliedDate: row.appliedDate?.getTime(),
    createdAt: row.createdAt?.getTime(),
    updatedAt: row.updatedAt?.getTime(),
  });

  getData = async (
    params: ListParamsRequest,
  ): Promise<ListParamsResponse<CandidateRow>> => {
    return this.buildQueryDataList(params, (query) =>
      query.leftJoin(requisition, eq(this.table.requisitionId, requisition.id)),
    );
  };
}

export default CandidateViewListModel;
