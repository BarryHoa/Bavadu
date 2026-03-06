import { and, eq, sql } from "drizzle-orm";

import { LocaleDataType } from "@base/shared/interface/Locale";

import { BaseModel } from "../BaseModel";
import {
  base_tb_notifications,
  NewBaseTbNotification,
} from "../../schemas/base.notification";

export interface NotificationRow {
  id: string;
  userId: string;
  type: string;
  title?: unknown;
  message?: unknown;
  link?: string | null;
  isRead: boolean;
  readAt?: number | null;
  metadata?: unknown;
  createdAt: number;
}

export interface NotificationInput {
  userId: string;
  type: string;
  title: LocaleDataType<string>;
  message: LocaleDataType<string>;
  link?: string | null;
  metadata?: unknown;
}

export interface NotificationQuery {
  userId: string;
  isRead?: boolean;
  type?: string;
  limit?: number;
  offset?: number;
}

export default class NotificationModel extends BaseModel<
  typeof base_tb_notifications
> {
  constructor() {
    super(base_tb_notifications);
  }

  getNotificationById = async (id: string): Promise<NotificationRow | null> => {
    const result = await this.db
      .select()
      .from(this.table)
      .where(eq(this.table.id, id))
      .limit(1);

    const row = result[0];
    if (!row) return null;

    return {
      id: row.id,
      userId: row.userId,
      type: row.type,
      title: row.title,
      message: row.message,
      link: row.link ?? undefined,
      isRead: row.isRead,
      readAt: row.readAt?.getTime(),
      metadata: row.metadata,
      createdAt: row.createdAt.getTime(),
    };
  };

  getDataById = async (params: {
    id: string;
  }): Promise<NotificationRow | null> => {
    return this.getNotificationById(params.id);
  };

  createNotification = async (
    payload: NotificationInput,
  ): Promise<NotificationRow> => {
    const insertData: NewBaseTbNotification = {
      userId: payload.userId,
      type: payload.type,
      title: payload.title,
      message: payload.message,
      link: payload.link ?? null,
      metadata: payload.metadata ?? null,
      isRead: false,
      createdAt: new Date(),
    };

    const [created] = await this.db
      .insert(this.table)
      .values(insertData)
      .returning({ id: this.table.id });

    if (!created) throw new Error("Failed to create notification");

    const notification = await this.getNotificationById(created.id);
    if (!notification)
      throw new Error("Failed to load notification after creation");

    return notification;
  };

  queryNotifications = async (
    query: NotificationQuery,
  ): Promise<{ notifications: NotificationRow[]; total: number }> => {
    const conditions = [eq(this.table.userId, query.userId)];

    if (query.isRead !== undefined) {
      conditions.push(eq(this.table.isRead, query.isRead));
    }
    if (query.type) {
      conditions.push(eq(this.table.type, query.type));
    }

    const whereClause = and(...conditions);

    const [rows, totalResult] = await Promise.all([
      this.db
        .select()
        .from(this.table)
        .where(whereClause)
        .orderBy(this.table.createdAt)
        .limit(query.limit ?? 50)
        .offset(query.offset ?? 0),
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(this.table)
        .where(whereClause),
    ]);

    return {
      notifications: rows.map((row) => ({
        id: row.id,
        userId: row.userId,
        type: row.type,
        title: row.title,
        message: row.message,
        link: row.link ?? undefined,
        isRead: row.isRead,
        readAt: row.readAt?.getTime(),
        metadata: row.metadata,
        createdAt: row.createdAt.getTime(),
      })),
      total: totalResult[0]?.count ?? 0,
    };
  };

  markAsRead = async (id: string): Promise<NotificationRow | null> => {
    await this.db
      .update(this.table)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where(eq(this.table.id, id));

    return this.getNotificationById(id);
  };

  markAllAsRead = async (userId: string): Promise<void> => {
    await this.db
      .update(this.table)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where(
        and(
          eq(this.table.userId, userId),
          eq(this.table.isRead, false),
        ),
      );
  };
}
