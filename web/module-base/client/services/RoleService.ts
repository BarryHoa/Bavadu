import ClientHttpService from "@base/client/services/ClientHttpService";
import type { LocalizeText } from "../interface/LocalizeText";

export type Role = {
  id: string;
  code: string;
  name: LocalizeText;
  description?: string;
  isSystem: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
};

export type Permission = {
  id: string;
  key: string;
  module: string;
  resource: string;
  action: string;
  name: LocalizeText;
  description?: string;
  isActive: boolean;
};

export type RoleWithPermissions = Role & {
  permissions: Permission[];
};

export type RoleListResponse = {
  success: boolean;
  data: Role[];
  total: number;
  message?: string;
};

export type RoleResponse = {
  success: boolean;
  data: RoleWithPermissions;
  message?: string;
};

export type PermissionListResponse = {
  success: boolean;
  data: Permission[];
  total: number;
  message?: string;
};

export type CreateRoleRequest = {
  code: string;
  name: LocalizeText;
  description?: string;
  permissionIds?: string[];
};

export type UpdateRoleRequest = {
  id: string;
  code: string;
  name: LocalizeText;
  description?: string;
  permissionIds?: string[];
};

export type CreateRoleResponse = {
  success: boolean;
  data: Role;
  message?: string;
};

export type UpdateRoleResponse = {
  success: boolean;
  data: Role;
  message?: string;
};

export type DeleteRoleResponse = {
  success: boolean;
  message?: string;
};

class RoleService extends ClientHttpService {
  constructor() {
    super("/api/base/settings/roles");
  }

  getRoleList() {
    return this.get<RoleListResponse>("/list");
  }

  getRole(id: string) {
    return this.get<RoleResponse>(`/get?id=${id}`);
  }

  createRole(payload: CreateRoleRequest) {
    return this.post<CreateRoleResponse>("/create", payload);
  }

  updateRole(payload: UpdateRoleRequest) {
    return this.put<UpdateRoleResponse>("/update", payload);
  }

  deleteRole(id: string) {
    return this.delete<DeleteRoleResponse>(`/delete?id=${id}`);
  }

  getPermissionList() {
    // Create a temporary service instance for permissions endpoint
    const permissionsService = new ClientHttpService("/api/base/settings/permissions");
    return permissionsService.get<PermissionListResponse>("/list");
  }
}

const roleService = new RoleService();
export default roleService;

