import JsonRpcClientService from "@base/client/services/JsonRpcClientService";

export interface UserRoleItem {
  id: string;
  roleId: string;
  code: string;
  name: unknown;
}

class UserRoleService extends JsonRpcClientService {
  async getRolesForUser(userId: string): Promise<UserRoleItem[]> {
    return this.call<UserRoleItem[]>("base-user-role.curd.getRolesForUser", {
      userId,
    });
  }

  async assignRoleToUser(params: {
    userId: string;
    roleId: string;
    createdBy?: string;
  }): Promise<{ id: string; userId: string; roleId: string; isActive: boolean }> {
    return this.call("base-user-role.curd.assignRoleToUser", params);
  }

  async revokeRoleFromUser(params: {
    userId: string;
    roleId: string;
  }): Promise<boolean> {
    return this.call<boolean>("base-user-role.curd.revokeRoleFromUser", params);
  }
}

const userRoleService = new UserRoleService();

export default userRoleService;
