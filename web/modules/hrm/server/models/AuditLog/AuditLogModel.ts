import { BaseModel } from "@base/server/models/BaseModel";
import { and, eq, gte, lte, sql } from "drizzle-orm";

import { NewTblAuditLog, table_audit_log } from "../../schemas";

export interface AuditLogRow {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  performedBy: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  changes?: unknown;
  metadata?: unknown;
  createdAt: number;
}

export interface AuditLogInput {
  entityType: string;
  entityId: string;
  action: string;
  performedBy: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  changes?: unknown;
  metadata?: unknown;
}

export interface AuditLogQuery {
  entityType?: string;
  entityId?: string;
  action?: string;
  performedBy?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export default class AuditLogModel extends BaseModel<typeof table_audit_log> {
  constructor() {
    super(table_audit_log);
  }

  createAuditLog = async (payload: AuditLogInput): Promise<AuditLogRow> => {
    const insertData: NewTblAuditLog = {
      entityType: payload.entityType,
      entityId: payload.entityId,
      action: payload.action,
      performedBy: payload.performedBy,
      ipAddress: payload.ipAddress ?? null,
      userAgent: payload.userAgent ?? null,
      changes: payload.changes ?? null,
      metadata: payload.metadata ?? null,
      createdAt: new Date(),
    };

    const [created] = await this.db
      .insert(this.table)
      .values(insertData)
      .returning();

    return {
      id: created.id,
      entityType: created.entityType,
      entityId: created.entityId,
      action: created.action,
      performedBy: created.performedBy,
      ipAddress: created.ipAddress ?? undefined,
      userAgent: created.userAgent ?? undefined,
      changes: created.changes ?? undefined,
      metadata: created.metadata ?? undefined,
      createdAt: created.createdAt.getTime(),
    };
  };

  queryAuditLogs = async (
    query: AuditLogQuery
  ): Promise<{ logs: AuditLogRow[]; total: number }> => {
    const conditions = [];

    if (query.entityType) {
      conditions.push(eq(this.table.entityType, query.entityType));
    }
    if (query.entityId) {
      conditions.push(eq(this.table.entityId, query.entityId));
    }
    if (query.action) {
      conditions.push(eq(this.table.action, query.action));
    }
    if (query.performedBy) {
      conditions.push(eq(this.table.performedBy, query.performedBy));
    }
    if (query.startDate) {
      conditions.push(gte(this.table.createdAt, query.startDate));
    }
    if (query.endDate) {
      conditions.push(lte(this.table.createdAt, query.endDate));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [logs, totalResult] = await Promise.all([
      this.db
        .select()
        .from(this.table)
        .where(whereClause)
        .orderBy(this.table.createdAt)
        .limit(query.limit ?? 100)
        .offset(query.offset ?? 0),
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(this.table)
        .where(whereClause),
    ]);

    return {
      logs: logs.map((log) => ({
        id: log.id,
        entityType: log.entityType,
        entityId: log.entityId,
        action: log.action,
        performedBy: log.performedBy,
        ipAddress: log.ipAddress ?? undefined,
        userAgent: log.userAgent ?? undefined,
        changes: log.changes ?? undefined,
        metadata: log.metadata ?? undefined,
        createdAt: log.createdAt.getTime(),
      })),
      total: totalResult[0]?.count ?? 0,
    };
  };
}

