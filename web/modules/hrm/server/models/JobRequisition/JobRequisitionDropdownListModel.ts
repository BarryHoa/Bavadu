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
import { ilike } from "drizzle-orm";

import { hrm_tb_job_requisitions } from "../../schemas";

export interface JobRequisitionDropdownRow {
  id: string;
  requisitionNumber: string;
  title?: unknown;
  isActive?: boolean;
}

class JobRequisitionDropdownListModel extends BaseViewListModel<
  typeof hrm_tb_job_requisitions,
  JobRequisitionDropdownRow
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
      [
        "requisitionNumber",
        { column: hrm_tb_job_requisitions.requisitionNumber, sort: true },
      ],
      ["title", { column: hrm_tb_job_requisitions.title, sort: true }],
    ]);

  constructor() {
    super({ table: hrm_tb_job_requisitions });
  }

  protected declarationSearch = () =>
    new Map([
      [
        "requisitionNumber",
        (text: string) =>
          ilike(hrm_tb_job_requisitions.requisitionNumber, text),
      ],
      ["title", (text: string) => ilike(hrm_tb_job_requisitions.title, text)],
    ]);

  protected declarationFilter = (): FilterConditionMap<ParamFilter> =>
    new Map() as FilterConditionMap<ParamFilter>;

  protected declarationMappingData = (row: any): JobRequisitionDropdownRow => ({
    id: row.id,
    requisitionNumber: row.requisitionNumber,
    title: row.title,
  });

  getData = async (
    params: ListParamsRequest,
  ): Promise<ListParamsResponse<JobRequisitionDropdownRow>> => {
    return this.buildQueryDataList(params);
  };
}

export default JobRequisitionDropdownListModel;
