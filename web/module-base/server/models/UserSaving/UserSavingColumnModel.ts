import UserSavingModel, { type UserSavingRow } from "./UserSavingModel";

class UserSavingColumnModel extends UserSavingModel {
  async get_saving_column(
    userId: string,
    key: string,
  ): Promise<UserSavingRow | null> {
    return super.get(userId, key, "column");
  }

  async set_saving_column(
    userId: string,
    key: string,
    values: Record<string, unknown> | null,
  ): Promise<UserSavingRow> {
    return super.set(userId, key, "column", values);
  }
}

export default UserSavingColumnModel;
