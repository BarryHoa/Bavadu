import { db } from "@/db";
import { users } from "@/db/schema";

class UsersModel {
  public async getUsers(params: {
    filters?: Record<string, any>;
    search?: string;
    sorts?: Array<{ field: string; direction: "asc" | "desc" }>;
    offset?: number;
    limit?: number;
  }) {
    const { filters = {}, search, sorts = [], offset = 0, limit = 10 } = params;
    let query: any = db.select().from(users);

    // Apply filters
    if (Object.keys(filters).length > 0) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.where(users[key as keyof typeof users], "=", value);
      });
    }

    // Apply search on username and email
    if (search) {
      query = query.where((eb: any) =>
        eb.or([
          eb("username", "ilike", `%${search}%`),
          eb("email", "ilike", `%${search}%`),
        ])
      );
    }

    // Apply sorting
    if (sorts.length > 0) {
      sorts.forEach(({ field, direction }) => {
        query = query.orderBy(users[field as keyof typeof users], direction);
      });
    }

    // Apply pagination
    query = query.limit(limit).offset(offset);
    console.log("query-------", query);
    return await query.execute();
  }
}

const usersModel = new UsersModel();
export default usersModel;
