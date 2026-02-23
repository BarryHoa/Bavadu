import JsonRpcClientService from "@base/client/services/JsonRpcClientService";

export interface EmployeeDto {
  id: string;
  userId?: string | null;
  employeeCode: string;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: unknown;
  email?: string | null;
  phone?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  nationalId?: string | null;
  taxId?: string | null;
  address?: unknown;
  positionId: string;
  position?: {
    id: string;
    name?: unknown;
  } | null;
  departmentId: string;
  department?: {
    id: string;
    name?: unknown;
  } | null;
  managerId?: string | null;
  manager?: {
    id: string;
    employeeCode?: string;
    fullName?: unknown;
  } | null;
  employmentStatus: string;
  employmentType?: string | null;
  hireDate: string;
  probationEndDate?: string | null;
  baseSalary?: number | null;
  currency?: string | null;
  locationId?: string | null;
  bankAccount?: string | null;
  bankName?: string | null;
  bankBranch?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  isActive?: boolean;
  createdAt?: number;
  updatedAt?: number;
}

/** HR-only + userId for create. Personal data (name, email, etc.) lives on user. */
export interface EmployeeCreatePayload {
  userId?: string | null;
  employeeCode: string;
  nationalId?: string | null;
  taxId?: string | null;
  positionId: string;
  departmentId: string;
  managerId?: string | null;
  employmentStatus?: string;
  employmentType?: string | null;
  hireDate: string;
  probationEndDate?: string | null;
  baseSalary?: number | null;
  currency?: string | null;
  locationId?: string | null;
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
  hireDate?: string;
  probationEndDate?: string | null;
  baseSalary?: number | null;
  currency?: string | null;
  locationId?: string | null;
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
    return this.call<{
      data: EmployeeDto;
      message?: string;
    }>("employee.curd.getById", { id });
  }

  getByUserId(userId: string) {
    return this.call<{
      data: EmployeeDto | null;
      message?: string;
    }>("employee.curd.getByUserId", { userId });
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
