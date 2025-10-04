import { db } from "@/db";
import { users } from "@/db/schema";
import { GetUserListReq } from "./UserInterface";
import { ModalController } from "../ModalController";
import { and, asc, desc, eq, or, sql } from "drizzle-orm/sql";
import omit from 'lodash/omit';
class UsersModel extends ModalController {
  public async getUsers(params: GetUserListReq) {
    const { filters = {}, search, sorts = [], offset = 0, limit = 10 } = params;
   let query: any = db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        createdAt: users.createdAt,
        total: sql<number>`count(*) OVER()`,
      })
      .from(users);

    // Apply filters
    if (Object.keys(filters).length > 0) {
      const conditions = Object.entries(filters).map(([key, value]) =>
        eq(users[key as keyof typeof users._.columns], value as any)
      );
      query = query.where(and(...conditions));
    }

     // Apply search
    if (search) {
      query = query.where(
        or(
          sql`${users.username} ILIKE ${"%" + search + "%"}`,
          sql`${users.email} ILIKE ${"%" + search + "%"}`
        )
      );
    }

    // Sorting
    if (sorts.length > 0) {
      sorts.forEach(({ field, direction }) => {
        // check field in users table
         const key = (users as any)?.[field];
        if (!key) return;
       
        query = query.orderBy(
          direction === "asc" ? asc(key) : desc(key)
        );
      });
    } else {
      query = query.orderBy(desc(users.createdAt));
    }

    // Pagination
    query = query.limit(limit).offset(offset);

    let rows = [];
    try {
      rows = await query;
    } catch (error) {
      console.error("Database query error:", error);
    }

    const isHasData =  rows?.length > 0;

    const total =isHasData ? Number(rows[0].total) : 0;

    const data =isHasData ? omit(rows, ['total']) : 0;

    return {
      data: data,
      total,
    };
  
  }
}

const usersModel = new UsersModel();
export default usersModel;
