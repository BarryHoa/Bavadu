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
      "base-user-saving-column.curd.get_columns",
      params,
    );
  }

  async setColumns(
    params: SetUserSavingColumnsParams,
  ): Promise<SetUserSavingColumnsResult> {
    return this.call<SetUserSavingColumnsResult>(
      "base-user-saving-column.curd.set_columns",
      params,
    );
  }
}

export default UserSavingColumnService;
