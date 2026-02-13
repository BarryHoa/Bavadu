import type { LocalizeText } from "../interface/LocalizeText";

import ClientHttpService from "@base/client/services/ClientHttpService";
import JsonRpcClientService from "@base/client/services/JsonRpcClientService";

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

class RoleService extends JsonRpcClientService {
  private get rolesHttp() {
    return new ClientHttpService("/api/base/settings/roles");
  }

  private get permissionsHttp() {
    return new ClientHttpService("/api/base/settings/permissions");
  }

  getRoleList() {
    return this.rolesHttp.get<RoleListResponse>("/list");
  }

  getRole(id: string) {
    return this.rolesHttp.get<RoleResponse>(`/get?id=${id}`);
  }

  async createRole(payload: CreateRoleRequest): Promise<CreateRoleResponse> {
    const data = await this.call<Role>("base-role.curd.create", {
      code: payload.code,
      name: payload.name,
      description: payload.description,
      permissionIds: payload.permissionIds,
    });

    return {
      success: true,
      data: data as Role,
      message: "Role created successfully",
    };
  }

  updateRole(payload: UpdateRoleRequest) {
    return this.rolesHttp.put<UpdateRoleResponse>("/update", payload);
  }

  deleteRole(id: string) {
    return this.rolesHttp.delete<DeleteRoleResponse>(`/delete?id=${id}`);
  }

  getPermissionList() {
    return this.permissionsHttp.get<PermissionListResponse>("/list");
  }
}

const roleService = new RoleService();

export default roleService;
