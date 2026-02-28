import JsonRpcClientService from "@base/client/services/JsonRpcClientService";

/** Align with server EmployeeRow (EmployeeModel). */
export interface EmployeeDto {
  employeeId: string;
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  emails?: string[] | null;
  phones?: string[] | null;
  nationalId: string | null;
  taxId: string | null;
  position: { id: string; name: string };
  department: { id: string; name: string };
  manager: { id: string; firstName: string; lastName: string };
  status: string;
  type: string;
  hireDate: string;
  probationEndDate: string;
  bankAccount: string;
  bankName: string;
  bankBranch: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  createdAt: Date;
  updatedAt: Date;
}

/** HR-only + userId for create. Personal data (name, email, etc.) lives on user. */
export interface EmployeeCreatePayload {
  userId: string;
  employeeCode: string;
  nationalId?: string | null;
  taxId?: string | null;
  positionId: string;
  departmentId: string;
  managerId?: string | null;
  employmentStatus?: string;
  employmentType?: string | null;
  hireDate?: string | null;
  probationEndDate?: string | null;
  bankAccount?: string | null;
  bankName?: string | null;
  bankBranch?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  isActive?: boolean;
}

/** HR-only for update. */
export interface EmployeeUpdatePayload {
  id: string;
  employeeCode?: string;
  nationalId?: string | null;
  taxId?: string | null;
  positionId?: string;
  departmentId?: string;
  managerId?: string | null;
  employmentStatus?: string;
  employmentType?: string | null;
  hireDate?: string | null;
  probationEndDate?: string | null;
  bankAccount?: string | null;
  bankName?: string | null;
  bankBranch?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  isActive?: boolean;
}

export default class EmployeeService extends JsonRpcClientService {
  list() {
    return this.call<{
      data: EmployeeDto[];
      total: number;
      message?: string;
    }>("employee.list.getData", {});
  }

  getById(id: string) {
    return this.call<EmployeeDto>("employee.curd.getDataByUserId", { id });
  }

  create(payload: EmployeeCreatePayload) {
    return this.call<{
      data: EmployeeDto;
      message?: string;
    }>("employee.curd.create", payload);
  }

  update(payload: EmployeeUpdatePayload) {
    return this.call<{
      data: EmployeeDto;
      message?: string;
    }>("employee.curd.update", payload);
  }
}

export const employeeService = new EmployeeService();
