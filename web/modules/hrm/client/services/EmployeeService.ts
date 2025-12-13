import JsonRpcClientService from "@base/client/services/JsonRpcClientService";

export interface EmployeeDto {
  id: string;
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
  isActive?: boolean;
  createdAt?: number;
  updatedAt?: number;
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

  create(payload: {
    employeeCode: string;
    firstName?: string | null;
    lastName?: string | null;
    fullName: { vi?: string; en?: string };
    email?: string | null;
    phone?: string | null;
    dateOfBirth?: string | null;
    gender?: string | null;
    nationalId?: string | null;
    taxId?: string | null;
    address?: unknown;
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
    isActive?: boolean;
  }) {
    return this.call<{
      data: EmployeeDto;
      message?: string;
    }>("employee.curd.create", payload);
  }

  update(payload: {
    id: string;
    employeeCode?: string;
    firstName?: string | null;
    lastName?: string | null;
    fullName?: { vi?: string; en?: string };
    email?: string | null;
    phone?: string | null;
    dateOfBirth?: string | null;
    gender?: string | null;
    nationalId?: string | null;
    taxId?: string | null;
    address?: unknown;
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
    isActive?: boolean;
  }) {
    return this.call<{
      data: EmployeeDto;
      message?: string;
    }>("employee.curd.update", payload);
  }
}

export const employeeService = new EmployeeService();


