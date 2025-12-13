import JsonRpcClientService from "@base/client/services/JsonRpcClientService";
import type {
  JobRequisitionDto,
  CreateJobRequisitionPayload,
  UpdateJobRequisitionPayload,
} from "../interface/JobRequisition";

export default class JobRequisitionService extends JsonRpcClientService {
  list() {
    return this.call<{
      data: JobRequisitionDto[];
      total: number;
      message?: string;
    }>("hrm.job-requisition.list.getData", {});
  }

  getById(id: string) {
    return this.call<{
      data: JobRequisitionDto;
      message?: string;
    }>("hrm.job-requisition.curd.getDataById", { id });
  }

  create(payload: CreateJobRequisitionPayload) {
    return this.call<{
      data: JobRequisitionDto;
      message?: string;
    }>("hrm.job-requisition.curd.createJobRequisition", payload);
  }

  update(payload: UpdateJobRequisitionPayload) {
    return this.call<{
      data: JobRequisitionDto;
      message?: string;
    }>("hrm.job-requisition.curd.updateData", payload);
  }
}

export const jobRequisitionService = new JobRequisitionService();

