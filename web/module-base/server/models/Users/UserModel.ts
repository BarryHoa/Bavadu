import type { NextRequest } from "next/server";

import { eq } from "drizzle-orm";

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
  getMe = async (
    _params: Record<string, unknown>,
    request?: NextRequest,
  ): Promise<{
    data: {
      user: { id: string; username?: string; avatar?: string | null } | null;
    };
  }> => {
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
  };
}

export default UserModel;
