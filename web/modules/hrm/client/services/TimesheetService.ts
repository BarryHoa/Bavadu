import type {
  CreateTimesheetPayload,
  TimesheetDto,
  UpdateTimesheetPayload,
} from "../interface/Timesheet";

import JsonRpcClientService from "@base/client/services/JsonRpcClientService";

export default class TimesheetService extends JsonRpcClientService {
  list() {
    return this.call<{
      data: TimesheetDto[];
      total: number;
      message?: string;
    }>("timesheet.list.getData", {});
  }

  getById(id: string) {
    return this.call<{
      data: TimesheetDto;
      message?: string;
    }>("timesheet.curd.getById", { id });
  }

  getMyTimesheet(params: {
    year: number;
    month: number;
    userId?: string | null;
  }) {
    return this.call<{
      data: TimesheetDto[];
      message?: string;
    }>("timesheet.curd.getMyTimesheet", params);
  }

  getTimesheetsByUserId(params: { userId: string; year: number; month: number }) {
    return this.call<{
      data: TimesheetDto[];
      message?: string;
    }>("timesheet.curd.getTimesheetsByUserId", params);
  }

  create(payload: CreateTimesheetPayload) {
    return this.call<{
      data: TimesheetDto;
      message?: string;
    }>("timesheet.curd.createTimesheet", payload);
  }

  update(payload: UpdateTimesheetPayload) {
    return this.call<{
      data: TimesheetDto;
      message?: string;
    }>("timesheet.curd.updateData", payload);
  }
}

export const timesheetService = new TimesheetService();
