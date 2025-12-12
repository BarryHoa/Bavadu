import { eq } from "drizzle-orm";

import { base_tb_users } from "../../schemas/base.user";
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
}

export default UserModel;
