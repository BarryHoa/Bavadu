import type { NextRequest } from "next/server";

import { eq } from "drizzle-orm";

import UserPermissionModel from "../UserPermission/UserPermissionModel";
import { base_tb_users, base_tb_users_login } from "../../schemas/base.user";
import { BaseModel } from "../BaseModel";

class UserModel extends BaseModel<typeof base_tb_users> {
  constructor() {
    super(base_tb_users);
  }

  getUserById = async (id: string) => {
    const user = await this.db
      .select()
      .from(this.table)
      .where(eq(this.table.id, id));

    return user[0];
  };

  /**
   * Get current user (no session validation here).
   * The private RPC endpoint must authenticate first and inject x-user-id/x-session-id headers.
   */
  @BaseModel.Auth({ required: true, permissions: ["user.view"] })
  async getMe(
    _params: Record<string, unknown>,
    request?: NextRequest,
  ): Promise<{
    data: {
      user: { id: string; username?: string; avatar?: string | null } | null;
    };
  }> {
    const userId = request?.headers.get("x-user-id") ?? null;

    if (!userId) return { data: { user: null } };

    const user = await this.getUserById(userId);

    if (!user) return { data: { user: null } };

    const [login] = await this.db
      .select({ username: base_tb_users_login.username })
      .from(base_tb_users_login)
      .where(eq(base_tb_users_login.userId, userId))
      .limit(1);

    return {
      data: {
        user: {
          id: user.id,
          username: login?.username ?? undefined,
          avatar: user.avatar ?? undefined,
        },
      },
    };
  }

  /**
   * Get current user with role codes and permissions (for client capability checks).
   * Returns roleCodes (e.g. ['admin','manager']), permissions array, and isGlobalAdmin.
   */
  @BaseModel.Auth({ required: true, permissions: ["user.view"] })
  async getMeWithRoles(
    _params: Record<string, unknown>,
    request?: NextRequest,
  ): Promise<{
    data: {
      user: { id: string; username?: string; avatar?: string | null } | null;
      roleCodes: string[];
      permissions: string[];
      isGlobalAdmin: boolean;
    };
  }> {
    const me = await this.getMe(_params, request);

    if (!me.data.user) {
      return {
        data: {
          user: null,
          roleCodes: [],
          permissions: [],
          isGlobalAdmin: false,
        },
      };
    }

    const userPermissionModel = new UserPermissionModel();
    const result = await userPermissionModel.getPermissionsByUser(
      me.data.user.id,
    );

    return {
      data: {
        user: me.data.user,
        roleCodes: result.roles.map((r) => r.code),
        permissions: Array.from(result.permissions),
        isGlobalAdmin: result.isGlobalAdmin ?? false,
      },
    };
  }
}

export default UserModel;
