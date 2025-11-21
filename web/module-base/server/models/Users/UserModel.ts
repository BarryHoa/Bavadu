import { eq } from "drizzle-orm";

import { table_user } from "../../schemas/user";
import { BaseModel } from "../BaseModel";

class UserModel extends BaseModel<typeof table_user> {
  constructor() {
    super(table_user);
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
