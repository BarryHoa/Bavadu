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

import { hrm_tb_job_requisitions } from "../../schemas";
import { hrm_tb_departments } from "../../schemas/hrm.department";
import { hrm_tb_positions } from "../../schemas/hrm.position";

const department = alias(hrm_tb_departments, "department");
const position = alias(hrm_tb_positions, "position");

export interface JobRequisitionRow {
  id: string;
  requisitionNumber: string;
  title?: unknown;
  departmentId: string;
  department?: {
    id: string;
    name?: unknown;
  } | null;
  positionId: string;
  position?: {
    id: string;
    name?: unknown;
  } | null;
  numberOfOpenings: number;
  priority?: string | null;
  status: string;
  openedDate?: string | null;
  closedDate?: string | null;
  createdAt?: number;
  updatedAt?: number;
}

class JobRequisitionViewListModel extends BaseViewListModel<
  typeof hrm_tb_job_requisitions,
  JobRequisitionRow
> {
  protected declarationColumns = () =>
    new Map<
      string,
      {
        column: Column<any>;
        sort?: boolean;
      }
    >([
      ["id", { column: hrm_tb_job_requisitions.id, sort: true }],
      ["requisitionNumber", { column: hrm_tb_job_requisitions.requisitionNumber, sort: true }],
      ["title", { column: hrm_tb_job_requisitions.title, sort: true }],
      ["departmentId", { column: hrm_tb_job_requisitions.departmentId, sort: true }],
      ["positionId", { column: hrm_tb_job_requisitions.positionId, sort: true }],
      ["numberOfOpenings", { column: hrm_tb_job_requisitions.numberOfOpenings, sort: true }],
      ["priority", { column: hrm_tb_job_requisitions.priority, sort: true }],
      ["status", { column: hrm_tb_job_requisitions.status, sort: true }],
      ["openedDate", { column: hrm_tb_job_requisitions.openedDate, sort: true }],
      ["createdAt", { column: hrm_tb_job_requisitions.createdAt, sort: true }],
      ["updatedAt", { column: hrm_tb_job_requisitions.updatedAt, sort: true }],
    ]);

  constructor() {
    super({ table: hrm_tb_job_requisitions });
  }

  protected declarationSearch = () =>
    new Map([
      ["requisitionNumber", (text: string) => ilike(hrm_tb_job_requisitions.requisitionNumber, text)],
      ["title", (text: string) => ilike(hrm_tb_job_requisitions.title, text)],
    ]);

  protected declarationFilter = (): FilterConditionMap<ParamFilter> =>
    new Map() as FilterConditionMap<ParamFilter>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected declarationMappingData = (row: any): JobRequisitionRow => ({
    id: row.id,
    requisitionNumber: row.requisitionNumber,
    title: row.title,
    departmentId: row.departmentId,
    department: row.departmentId
      ? {
          id: row.departmentId,
          name: row.departmentName ?? undefined,
        }
      : null,
    positionId: row.positionId,
    position: row.positionId
      ? {
          id: row.positionId,
          name: row.positionName ?? undefined,
        }
      : null,
    numberOfOpenings: row.numberOfOpenings,
    priority: row.priority ?? undefined,
    status: row.status,
    openedDate: row.openedDate ?? undefined,
    closedDate: row.closedDate ?? undefined,
    createdAt: row.createdAt?.getTime(),
    updatedAt: row.updatedAt?.getTime(),
  });

  getData = async (
    params: ListParamsRequest
  ): Promise<ListParamsResponse<JobRequisitionRow>> => {
    return this.buildQueryDataList(params, (query) =>
      query
        .leftJoin(department, eq(this.table.departmentId, department.id))
        .leftJoin(position, eq(this.table.positionId, position.id))
    );
  };
}

export default JobRequisitionViewListModel;

