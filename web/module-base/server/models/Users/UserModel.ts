import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";

import { base_tb_users } from "../../schemas/base.user";
import { getSessionInfo } from "../../utils/auth-helpers";
import { BaseModel } from "../BaseModel";
import SessionModel from "../Sessions/SessionModel";

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
   * Get current user from session: getSessionInfo(request) → validateSession(token) → user.
   * RPC: base-user.curd.getMe. Returns { data: { user } } or user null when no valid session.
   */
  getMe = async (
    _params: Record<string, unknown>,
    request?: NextRequest,
  ): Promise<{
    data: {
      user: { id: string; username?: string; avatar?: string | null } | null;
    };
  }> => {
    if (!request) return { data: { user: null } };
    const session = getSessionInfo(request);
    if (!session?.token) return { data: { user: null } };
    const sessionModel = new SessionModel();
    const result = await sessionModel.validateSession(session.token);

    if (!result?.valid || !result?.session?.userId)
      return { data: { user: null } };
    const user = await this.getUserById(result.session.userId);
    if (!user) return { data: { user: null } };

    return {
      data: {
        user: user,
      },
    };
  };
}

export default UserModel;
