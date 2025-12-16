import JsonRpcClientService from "@base/client/services/JsonRpcClientService";

export interface DepartmentDto {
  id: string;
  code: string;
  name?: unknown;
  description?: unknown;
  level?: number;
  isActive?: boolean;
  parent?: {
    id: string;
    name?: unknown;
  } | null;
  managerId?: string | null;
  locationId?: string | null;
  createdAt?: number;
  updatedAt?: number;
}

export default class DepartmentService extends JsonRpcClientService {
  list() {
    return this.call<{
      data: DepartmentDto[];
      total: number;
      message?: string;
    }>("department.list.getData", {});
  }

  getById(id: string) {
    return this.call<{
      data: DepartmentDto;
      message?: string;
    }>("department.curd.getById", { id });
  }

  create(payload: {
    code: string;
    name: { vi?: string; en?: string };
    description?: { vi?: string; en?: string } | null;
    parentId?: string | null;
    level?: number | null;
    managerId?: string | null;
    locationId?: string | null;
    isActive?: boolean;
  }) {
    return this.call<{
      data: DepartmentDto;
      message?: string;
    }>("department.curd.create", payload);
  }

  update(payload: {
    id: string;
    code?: string;
    name?: { vi?: string; en?: string };
    description?: { vi?: string; en?: string } | null;
    parentId?: string | null;
    level?: number | null;
    managerId?: string | null;
    locationId?: string | null;
    isActive?: boolean;
  }) {
    return this.call<{
      data: DepartmentDto;
      message?: string;
    }>("department.curd.update", payload);
  }
}

export const departmentService = new DepartmentService();
