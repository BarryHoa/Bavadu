import type {
  PayrollDto,
  CreatePayrollPayload,
  UpdatePayrollPayload,
} from "../interface/Payroll";

import JsonRpcClientService from "@base/client/services/JsonRpcClientService";

export default class PayrollService extends JsonRpcClientService {
  list() {
    return this.call<{
      data: PayrollDto[];
      total: number;
      message?: string;
    }>("hrm.payroll.list.getData", {});
  }

  getById(id: string) {
    return this.call<{
      data: PayrollDto;
      message?: string;
    }>("hrm.payroll.curd.getDataById", { id });
  }

  create(payload: CreatePayrollPayload) {
    return this.call<{
      data: PayrollDto;
      message?: string;
    }>("hrm.payroll.curd.createPayroll", payload);
  }

  update(payload: UpdatePayrollPayload) {
    return this.call<{
      data: PayrollDto;
      message?: string;
    }>("hrm.payroll.curd.updateData", payload);
  }
}

export const payrollService = new PayrollService();
