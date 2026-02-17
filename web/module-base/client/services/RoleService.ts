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
  // Module-level admin flags loaded from is_admin_modules JSONB
  isAdminModules?: Record<string, boolean>;
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
  isAdminModules?: Record<string, boolean>;
};

export type UpdateRoleRequest = {
  id: string;
  code: string;
  name: LocalizeText;
  description?: string;
  permissionIds?: string[];
  isAdminModules?: Record<string, boolean>;
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

  async getRole(id: string): Promise<RoleResponse> {
    const data = await this.call<RoleWithPermissions | null>(
      "base-role-permission.curd.get",
      { id },
    );

    if (!data) {
      throw new Error("Role not found");
    }

    return {
      success: true,
      data,
      message: "Role loaded",
    };
  }

  async createRole(payload: CreateRoleRequest): Promise<CreateRoleResponse> {
    const data = await this.call<Role>("base-role-permission.curd.create", {
      code: payload.code,
      name: payload.name,
      description: payload.description,
      permissionIds: payload.permissionIds,
      isAdminModules: payload.isAdminModules,
    });

    return {
      success: true,
      data: data as Role,
      message: "Role created successfully",
    };
  }

  async updateRole(payload: UpdateRoleRequest): Promise<UpdateRoleResponse> {
    const data = await this.call<Role | null>(
      "base-role-permission.curd.update",
      {
        id: payload.id,
        code: payload.code,
        name: payload.name,
        description: payload.description,
        permissionIds: payload.permissionIds,
        isAdminModules: payload.isAdminModules,
      },
    );

    if (!data) {
      throw new Error("Role not found");
    }

    return {
      success: true,
      data: data as Role,
      message: "Role updated successfully",
    };
  }

  async deleteRole(id: string): Promise<DeleteRoleResponse> {
    const result = await this.call<{ success: boolean; message: string }>(
      "base-role-permission.curd.delete",
      { id },
    );

    return {
      success: result.success,
      message: result.message,
    };
  }

  async getPermissionList(): Promise<PermissionListResponse> {
    const data = await this.call<Permission[]>(
      "base-permission.curd.getPermissions",
      {},
    );

    return {
      success: true,
      data,
      total: data.length,
      message: "Permissions loaded",
    };
  }
}

const roleService = new RoleService();

export default roleService;
