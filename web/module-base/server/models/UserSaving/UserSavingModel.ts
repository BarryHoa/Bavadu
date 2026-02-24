import { and, eq } from "drizzle-orm";

import { base_tb_user_saving } from "../../schemas/base.user-saving";
import { BaseModel } from "../BaseModel";

export interface UserSavingRow {
  userId: string;
  key: string;
  values: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSavingItem {
  key: string;
  values: Record<string, unknown> | null;
}

class UserSavingModel extends BaseModel<typeof base_tb_user_saving> {
  constructor() {
    super(base_tb_user_saving);
  }

  /**
   * Lấy giá trị theo user và key.
   */
  async get(
    userId: string,
    key: string,
  ): Promise<Record<string, unknown> | null> {
    const [row] = await this.db
      .select({ values: this.table.values })
      .from(this.table)
      .where(
        and(
          eq(this.table.userId, userId),
          eq(this.table.key, key),
        ),
      )
      .limit(1);

    return (row?.values ?? null) as Record<string, unknown> | null;
  }

  /**
   * Lấy full row theo user và key.
   */
  async getRow(userId: string, key: string): Promise<UserSavingRow | null> {
    const [row] = await this.db
      .select()
      .from(this.table)
      .where(
        and(
          eq(this.table.userId, userId),
          eq(this.table.key, key),
        ),
      )
      .limit(1);

    if (!row) {
      return null;
    }

    return {
      userId: row.userId,
      key: row.key,
      values: row.values as Record<string, unknown> | null,
      createdAt: row.createdAt!,
      updatedAt: row.updatedAt!,
    };
  }

  /**
   * Ghi (insert hoặc update) theo user + key. values có thể là object bất kỳ (jsonb).
   */
  async set(
    userId: string,
    key: string,
    values: Record<string, unknown> | null,
  ): Promise<UserSavingRow> {
    const now = new Date();

    const [row] = await this.db
      .insert(this.table)
      .values({
        userId,
        key,
        values,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [this.table.userId, this.table.key],
        set: {
          values,
          updatedAt: now,
        },
      })
      .returning();

    if (!row) {
      throw new Error("UserSavingModel.set: failed to upsert");
    }

    return {
      userId: row.userId,
      key: row.key,
      values: row.values as Record<string, unknown> | null,
      createdAt: row.createdAt!,
      updatedAt: row.updatedAt!,
    };
  }

  /**
   * Xóa một bản ghi theo user + key.
   */
  async delete(userId: string, key: string): Promise<boolean> {
    const result = await this.db
      .delete(this.table)
      .where(
        and(
          eq(this.table.userId, userId),
          eq(this.table.key, key),
        ),
      )
      .returning();

    return result.length > 0;
  }

  /**
   * Lấy tất cả saving của một user (vd: để list keys hoặc prefetch).
   */
  async getByUser(userId: string): Promise<UserSavingItem[]> {
    const rows = await this.db
      .select({ key: this.table.key, values: this.table.values })
      .from(this.table)
      .where(eq(this.table.userId, userId));

    return rows.map((r) => ({
      key: r.key,
      values: r.values as Record<string, unknown> | null,
    }));
  }
}

export default UserSavingModel;
