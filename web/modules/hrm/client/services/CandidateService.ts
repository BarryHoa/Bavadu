import type {
  CandidateDto,
  CreateCandidatePayload,
  UpdateCandidatePayload,
} from "../interface/Candidate";

import JsonRpcClientService from "@base/client/services/JsonRpcClientService";

export default class CandidateService extends JsonRpcClientService {
  list() {
    return this.call<{
      data: CandidateDto[];
      total: number;
      message?: string;
    }>("hrm.candidate.list.getData", {});
  }

  getById(id: string) {
    return this.call<{
      data: CandidateDto;
      message?: string;
    }>("hrm.candidate.curd.getDataById", { id });
  }

  create(payload: CreateCandidatePayload) {
    return this.call<{
      data: CandidateDto;
      message?: string;
    }>("hrm.candidate.curd.createCandidate", payload);
  }

  update(payload: UpdateCandidatePayload) {
    return this.call<{
      data: CandidateDto;
      message?: string;
    }>("hrm.candidate.curd.updateData", payload);
  }
}

export const candidateService = new CandidateService();
