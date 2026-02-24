import JsonRpcClientService from "./JsonRpcClientService";

export interface GetUserSavingColumnsParams {
  key: string;
}

export interface SetUserSavingColumnsParams {
  key: string;
  columns: string[];
}

export interface GetUserSavingColumnsResult {
  success: boolean;
  columns: string[];
}

export interface SetUserSavingColumnsResult {
  success: boolean;
}

class UserSavingColumnService extends JsonRpcClientService {
  async getColumns(
    params: GetUserSavingColumnsParams,
  ): Promise<GetUserSavingColumnsResult> {
    return this.call<GetUserSavingColumnsResult>(
      "user-saving.column.getColumns",
      params,
    );
  }

  async setColumns(
    params: SetUserSavingColumnsParams,
  ): Promise<SetUserSavingColumnsResult> {
    return this.call<SetUserSavingColumnsResult>(
      "user-saving.column.setColumns",
      params,
    );
  }
}

export default UserSavingColumnService;

