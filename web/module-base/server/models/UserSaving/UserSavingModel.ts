import { and, eq } from "drizzle-orm";

import { base_tb_user_saving } from "../../schemas/base.user-saving";
import BaseModelCached from "../BaseModelCached";

export interface UserSavingRow {
  id: string;
  userId: string;
  key: string;
  group: string;
  values: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSavingItem {
  key: string;
  group: string;
  values: Record<string, unknown> | null;
}

class UserSavingModel extends BaseModelCached<
  typeof base_tb_user_saving,
  UserSavingRow | null
> {
  protected cachePrefix = "user-saving:";

  constructor() {
    super(base_tb_user_saving);
  }

  protected getCachedKey(
    userId: string,
    key: string,
    group?: string | null,
  ): string {
    return `${userId}:${key}:${group ?? "default"}`;
  }

  /**
   * Lấy full row theo user và key.
   */
  protected async get(
    userId: string,
    key: string,
    group?: string | null,
  ): Promise<UserSavingRow | null> {
    const cacheResult = await this.cacheGet<UserSavingRow | null>(
      this.getCachedKey(userId, key, group),
    );

    if (cacheResult !== this.CACHE_NOT_FOUND) {
      return cacheResult as UserSavingRow | null;
    }

    const [row] = await this.db
      .select()
      .from(this.table)
      .where(
        and(
          eq(this.table.userId, userId),
          eq(this.table.key, key),
          ...(group != null ? [eq(this.table.group, group)] : []),
        ),
      )
      .limit(1);

    if (!row) {
      return null;
    }
    await this.cacheSet(row, this.getCachedKey(userId, key, group));

    return row as UserSavingRow;
  }

  /**
   * Ghi (insert hoặc update) theo user + key. values có thể là object bất kỳ (jsonb).
   */
  protected async set(
    userId: string,
    key: string,
    group: string,
    values: Record<string, unknown> | null,
  ): Promise<UserSavingRow> {
    const now = new Date();

    const [row] = await this.db
      .insert(this.table)
      .values({
        userId,
        key,
        group: group ?? "default",
        values,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [this.table.userId, this.table.key, this.table.group],
        set: {
          group: group ?? "default",
          values,
          updatedAt: now,
        },
      })
      .returning();

    if (!row) {
      throw new Error("UserSavingModel.set: failed to upsert");
    }

    await this.cacheSet(
      row as UserSavingRow,
      this.getCachedKey(row.userId, row.key, row.group),
    );

    return row as UserSavingRow;
  }

  /**
   * Xóa một bản ghi theo user + key.
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .delete(this.table)
      .where(eq(this.table.id, id))
      .returning();

    const row = result[0] as UserSavingRow | null;

    if (row) {
      await this.cacheDelete(this.getCachedKey(row.userId, row.key, row.group));
    }

    return row !== null;
  }

  /**
   * Lấy tất cả saving của một user (vd: để list keys hoặc prefetch).
   */
  async getByUser(userId: string): Promise<UserSavingItem[]> {
    const rows = await this.db
      .select({
        key: this.table.key,
        group: this.table.group,
        values: this.table.values,
      })
      .from(this.table)
      .where(eq(this.table.userId, userId));

    return rows.map((r) => ({
      key: r.key,
      group: (r as any).group ?? null,
      values: r.values as Record<string, unknown> | null,
    }));
  }
}

export default UserSavingModel;
