import JsonRpcClientService from "@base/client/services/JsonRpcClientService";

export interface AuthUser {
  id: string;
  username: string;
  avatar?: string;
}

export interface GetMeResult {
  data: { user: AuthUser | null };
}

class UserService extends JsonRpcClientService {
  /**
   * Get current authenticated user (via RPC base-user.curd.getMe).
   * Returns { data: { user } } with user null when not authenticated.
   */
  async getMe(): Promise<GetMeResult> {
    return this.call<GetMeResult>("base-user.curd.getMe", {});
  }
}

const userService = new UserService();

export default userService;
