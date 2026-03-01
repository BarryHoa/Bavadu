import JsonRpcClientService from "@base/client/services/JsonRpcClientService";

/** Align with server EmployeeRow (EmployeeModel). */
export interface EmployeeDto {
  employeeId: string;
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  commonName?: string | null;
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

/**
 * Create employee = Register user (loginIdentifier, password) + employee record + roles.
 * User: loginIdentifier (email or username), password, emails[], phones[], firstName, lastName, bio, address, dateOfBirth, gender, notes.
 * Employee: employeeCode, nationalId (required), positionId, departmentId, ... (no manager).
 */
export interface EmployeeCreatePayload {
  loginIdentifier: string;
  password: string;
  emails?: string[] | null;
  phones?: string[] | null;
  firstName?: string | null;
  lastName?: string | null;
  commonName?: string | null;
  bio?: string | null;
  address?: Record<string, unknown> | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  notes?: string | null;
  employeeCode: string;
  nationalId: string;
  taxId?: string | null;
  positionId: string;
  departmentId: string;
  employmentStatus?: string | null;
  employmentType?: string | null;
  hireDate?: string | null;
  probationEndDate?: string | null;
  bankAccount?: string | null;
  bankName?: string | null;
  bankBranch?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  roleIds?: string[];
  educationLevel?: string | null;
  experience?: string | null;
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
