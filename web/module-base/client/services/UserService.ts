import JsonRpcClientService from "@base/client/services/JsonRpcClientService";

export interface AuthUser {
  id: string;
  username?: string;
  avatar?: string | null;
}

export interface GetMeResult {
  data: { user: AuthUser | null };
}

export interface GetMeWithRolesResult {
  data: {
    user: AuthUser | null;
    roleCodes: string[];
    permissions: string[];
    isGlobalAdmin: boolean;
  };
}

class UserService extends JsonRpcClientService {
  /**
   * Get current authenticated user (via RPC base-user.curd.getMe).
   * Returns { data: { user } } with user null when not authenticated.
   */
  async getMe(): Promise<GetMeResult> {
    return this.call<GetMeResult>("base-user.curd.getMe", {});
  }

  /**
   * Get current user with role codes and permissions (for capability checks).
   * Only admin/system can change other users' permissions.
   */
  async getMeWithRoles(): Promise<GetMeWithRolesResult> {
    return this.call<GetMeWithRolesResult>("base-user.curd.getMeWithRoles", {});
  }

  /** Check if login identifier (email or username) already exists. */
  async checkLoginIdentifierExists(
    identifier: string,
  ): Promise<{ exists: boolean }> {
    return this.call<{ exists: boolean }>(
      "base-user.curd.checkLoginIdentifierExists",
      { identifier: identifier.trim() },
    );
  }
}

const userService = new UserService();

export default userService;
