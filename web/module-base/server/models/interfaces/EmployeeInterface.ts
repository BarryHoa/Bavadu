export interface GetEmployeeListReq {
  filters?: Record<string, any>;
  search?: string;
  sorts?: Array<{
    field: string;
    direction: "asc" | "desc";
  }>;
  offset?: number;
  limit?: number;
}

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  position: string;
  department: string;
  status: string;
  avatar?: string;
  joinDate: string;
  salary?: string;
  address?: string;
  dateOfBirth?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEmployeeReq {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  position: string;
  department: string;
  status?: string;
  avatar?: string;
  joinDate: string;
  salary?: string;
  address?: string;
  dateOfBirth?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
}

export interface UpdateEmployeeReq extends Partial<CreateEmployeeReq> {
  id: number;
}

