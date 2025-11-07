import { eq } from "drizzle-orm";

import { table_user } from "../../schemas/user";
import { BaseModel } from "../BaseModel";
import { getEnv } from "../..";

class UserModel extends BaseModel {
  constructor() {
    super();
  }

  getUserById = async (id: string) => {
   const db = getEnv()?.getDb() ?? null;
   if (!db) {
    throw new Error('Database not initialized');
   }
    const user = await db.select().from(table_user).where(eq(table_user.id, id));
    return user[0];
  };
}

export default UserModel;
