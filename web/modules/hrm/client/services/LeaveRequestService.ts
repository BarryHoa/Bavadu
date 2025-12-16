import type {
  LeaveRequestDto,
  CreateLeaveRequestPayload,
  UpdateLeaveRequestPayload,
} from "../interface/LeaveRequest";

import JsonRpcClientService from "@base/client/services/JsonRpcClientService";

export default class LeaveRequestService extends JsonRpcClientService {
  list() {
    return this.call<{
      data: LeaveRequestDto[];
      total: number;
      message?: string;
    }>("hrm.leave-request.list.getData", {});
  }

  getById(id: string) {
    return this.call<{
      data: LeaveRequestDto;
      message?: string;
    }>("hrm.leave-request.curd.getDataById", { id });
  }

  create(payload: CreateLeaveRequestPayload) {
    return this.call<{
      data: LeaveRequestDto;
      message?: string;
    }>("hrm.leave-request.curd.createLeaveRequest", payload);
  }

  update(payload: UpdateLeaveRequestPayload) {
    return this.call<{
      data: LeaveRequestDto;
      message?: string;
    }>("hrm.leave-request.curd.updateData", payload);
  }
}

export const leaveRequestService = new LeaveRequestService();
