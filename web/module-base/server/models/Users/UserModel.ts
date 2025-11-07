import { eq } from "drizzle-orm";

import { table_user } from "../../schemas/user";
import { BaseModel } from "../BaseModel";
import { getEnv } from "../..";

class UserModel extends BaseModel {
  constructor() {
    super();
  }

  getUserById = async (id: string) => {
   const db = getEnv()?.getDb();
    const user = await db.query.table_user.findFirst({
      where: eq(table_user.id, id),
    });
    return user;
  };
}

export default UserModel;
