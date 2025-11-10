import { eq } from "drizzle-orm";

import { getEnv } from "../..";
import { table_user } from "../../schemas/user";
import { BaseModel } from "../BaseModel";

class UserModel extends BaseModel {
  constructor() {
    super(table_user);
  }

  getUserById = async (id: string) => {
    const db = getEnv()?.getDb() ?? null;
    if (!db) {
      throw new Error("Database not initialized");
    }
    const user = await db
      .select()
      .from(this.table)
      .where(eq(table_user.id, id));
    return user[0];
  };
}

export default UserModel;
