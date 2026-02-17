import type {
  TimesheetDto,
  CreateTimesheetPayload,
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

  getByMonth(params: {
    year: number;
    month: number;
    employeeId?: string | null;
  }) {
    return this.call<{
      data: TimesheetDto[];
      message?: string;
    }>("timesheet.curd.getTimesheetsByMonth", params);
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
