import { and, eq, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { LocaleDataType } from "@base/shared/interface/Locale";
import { BaseModel } from "@base/server/models/BaseModel";

import { NewHrmTbNotification, hrm_tb_notifications } from "../../schemas";
import { hrm_tb_employees } from "../../schemas/hrm.employee";

const employee = alias(hrm_tb_employees, "employee");

export interface NotificationRow {
  id: string;
  employeeId: string;
  employee?: {
    id: string;
    employeeCode?: string;
    fullName?: unknown;
  } | null;
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
  employeeId: string;
  type: string;
  title: LocaleDataType<string>;
  message: LocaleDataType<string>;
  link?: string | null;
  metadata?: unknown;
}

export interface NotificationQuery {
  employeeId: string;
  isRead?: boolean;
  type?: string;
  limit?: number;
  offset?: number;
}

export default class NotificationModel extends BaseModel<
  typeof hrm_tb_notifications
> {
  constructor() {
    super(hrm_tb_notifications);
  }

  private normalizeLocaleInput(value: unknown): LocaleDataType<string> | null {
    if (!value) return null;
    if (typeof value === "string") return { en: value };
    if (typeof value === "object") return value as LocaleDataType<string>;

    return null;
  }

  getNotificationById = async (id: string): Promise<NotificationRow | null> => {
    const result = await this.db
      .select({
        id: this.table.id,
        employeeId: this.table.employeeId,
        employeeCode: employee.code,
        employeeFullName: sql<string>`''`.as("employeeFullName"),
        type: this.table.type,
        title: this.table.title,
        message: this.table.message,
        link: this.table.link,
        isRead: this.table.isRead,
        readAt: this.table.readAt,
        metadata: this.table.metadata,
        createdAt: this.table.createdAt,
      })
      .from(this.table)
      .leftJoin(employee, eq(this.table.employeeId, employee.id))
      .where(eq(this.table.id, id))
      .limit(1);

    const row = result[0];

    if (!row) return null;

    return {
      id: row.id,
      employeeId: row.employeeId,
      employee: row.employeeId
        ? {
            id: row.employeeId,
            employeeCode: row.employeeCode ?? undefined,
            fullName: row.employeeFullName ?? undefined,
          }
        : null,
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
    const insertData: NewHrmTbNotification = {
      employeeId: payload.employeeId,
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
    const conditions = [eq(this.table.employeeId, query.employeeId)];

    if (query.isRead !== undefined) {
      conditions.push(eq(this.table.isRead, query.isRead));
    }
    if (query.type) {
      conditions.push(eq(this.table.type, query.type));
    }

    const whereClause = and(...conditions);

    const [notifications, totalResult] = await Promise.all([
      this.db
        .select({
          id: this.table.id,
          employeeId: this.table.employeeId,
          employeeCode: employee.code,
          employeeFullName: sql<string>`''`.as("employeeFullName"),
          type: this.table.type,
          title: this.table.title,
          message: this.table.message,
          link: this.table.link,
          isRead: this.table.isRead,
          readAt: this.table.readAt,
          metadata: this.table.metadata,
          createdAt: this.table.createdAt,
        })
        .from(this.table)
        .leftJoin(employee, eq(this.table.employeeId, employee.id))
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
      notifications: notifications.map((row) => ({
        id: row.id,
        employeeId: row.employeeId,
        employee: row.employeeId
          ? {
              id: row.employeeId,
              employeeCode: row.employeeCode ?? undefined,
              fullName: row.employeeFullName ?? undefined,
            }
          : null,
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

  markAllAsRead = async (employeeId: string): Promise<void> => {
    await this.db
      .update(this.table)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where(
        and(
          eq(this.table.employeeId, employeeId),
          eq(this.table.isRead, false),
        ),
      );
  };
}
