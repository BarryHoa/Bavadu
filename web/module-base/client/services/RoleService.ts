import type { LocalizeText } from "../interface/LocalizeText";

import { Permission, Role } from "@base/client/interface/RoleAndPermission";
import JsonRpcClientService from "@base/client/services/JsonRpcClientService";

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
