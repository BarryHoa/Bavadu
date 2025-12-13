import JsonRpcClientService from "@base/client/services/JsonRpcClientService";

export interface PositionDto {
  id: string;
  code: string;
  name?: unknown;
  description?: unknown;
  departmentId: string;
  department?: {
    id: string;
    name?: unknown;
  } | null;
  jobFamily?: string | null;
  jobGrade?: string | null;
  reportsTo?: string | null;
  reportingPosition?: {
    id: string;
    name?: unknown;
  } | null;
  minSalary?: number | null;
  maxSalary?: number | null;
  isActive?: boolean;
  createdAt?: number;
  updatedAt?: number;
}

export default class PositionService extends JsonRpcClientService {
  list() {
    return this.call<{
      data: PositionDto[];
      total: number;
      message?: string;
    }>("position.list.getData", {});
  }

  getById(id: string) {
    return this.call<{
      data: PositionDto;
      message?: string;
    }>("position.curd.getById", { id });
  }

  create(payload: {
    code: string;
    name: { vi?: string; en?: string };
    description?: { vi?: string; en?: string } | null;
    departmentId: string;
    jobFamily?: string | null;
    jobGrade?: string | null;
    reportsTo?: string | null;
    minSalary?: number | null;
    maxSalary?: number | null;
    isActive?: boolean;
  }) {
    return this.call<{
      data: PositionDto;
      message?: string;
    }>("position.curd.create", payload);
  }

  update(payload: {
    id: string;
    code?: string;
    name?: { vi?: string; en?: string };
    description?: { vi?: string; en?: string } | null;
    departmentId?: string;
    jobFamily?: string | null;
    jobGrade?: string | null;
    reportsTo?: string | null;
    minSalary?: number | null;
    maxSalary?: number | null;
    isActive?: boolean;
  }) {
    return this.call<{
      data: PositionDto;
      message?: string;
    }>("position.curd.update", payload);
  }
}

export const positionService = new PositionService();


