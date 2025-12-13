import JsonRpcClientService from "@base/client/services/JsonRpcClientService";
import type {
  LeaveTypeDto,
  CreateLeaveTypePayload,
  UpdateLeaveTypePayload,
} from "../interface/LeaveType";

export default class LeaveTypeService extends JsonRpcClientService {
  list() {
    return this.call<{
      data: LeaveTypeDto[];
      total: number;
      message?: string;
    }>("hrm.leave-type.list.getData", {});
  }

  getById(id: string) {
    return this.call<{
      data: LeaveTypeDto;
      message?: string;
    }>("hrm.leave-type.curd.getDataById", { id });
  }

  create(payload: CreateLeaveTypePayload) {
    return this.call<{
      data: LeaveTypeDto;
      message?: string;
    }>("hrm.leave-type.curd.createLeaveType", payload);
  }

  update(payload: UpdateLeaveTypePayload) {
    return this.call<{
      data: LeaveTypeDto;
      message?: string;
    }>("hrm.leave-type.curd.updateData", payload);
  }
}

export const leaveTypeService = new LeaveTypeService();

