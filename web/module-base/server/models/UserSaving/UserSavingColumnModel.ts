import { NextRequest } from "next/server";

import UserSavingModel from "./UserSavingModel";

const GROUP = "column";

class UserSavingColumnModel extends UserSavingModel {
  /**
   * RPC: base-user-saving-column.curd.get_columns
   * Called with (params, request). params = { key }.
   */
  get_columns = async (
    params: { key?: string },
    request?: NextRequest,
  ): Promise<{ success: boolean; columns: string[] }> => {
    const userId = request?.headers.get("x-user-id") ?? null;
    console.log({ userId, key: params?.key });
    const key = params?.key ?? "";
    if (!userId || !key) {
      throw new Error("User ID and key are required to get columns");
    }
    const row = await this.get_saving(userId, key, GROUP);
    const columns =
      (row?.values as { columns?: string[] } | null)?.columns ?? [];
    return { success: true, columns };
  };

  /**
   * RPC: base-user-saving-column.curd.set_columns
   * Called with (params, request). params = { key, columns }.
   */
  set_columns = async (
    params: { key?: string; columns?: string[] },
    request?: NextRequest,
  ): Promise<{ success: boolean }> => {
    const userId = request?.headers.get("x-user-id") ?? null;
    const key = params?.key ?? "";
    const columns = Array.isArray(params?.columns) ? params.columns : [];
    if (!userId || !key) {
      throw new Error("User ID and key are required to save columns");
    }
    await this.set_saving(userId, key, GROUP, { columns });
    return { success: true };
  };
}

export default UserSavingColumnModel;
