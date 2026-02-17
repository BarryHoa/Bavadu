import { and, desc, eq, inArray, sql } from "drizzle-orm";

import { BaseModel } from "@base/server/models/BaseModel";

import {
  base_tb_sequence_counts,
  base_tb_sequence_rules,
} from "../../schemas";

export interface SequenceRuleRow {
  id: string;
  name: string;
  prefix: string;
  format: string;
  start: number;
  step: number;
  currentValue: number;
  isActive?: boolean;
  countCount?: number;
  counts?: { value: string; createdAt?: number }[];
  createdAt?: number;
  updatedAt?: number;
}

export interface SequenceRuleInput {
  name: string;
  prefix?: string;
  format?: string;
  start?: number;
  step?: number;
}

const MAX_COUNTS_PER_RULE = 3;

function formatValue(prefix: string, format: string, value: number): string {
  const match = format.match(/%0?(\d+)d/);
  const width = match ? parseInt(match[1], 10) : 6;
  const numStr = String(value).padStart(width, "0");

  return prefix ? `${prefix}-${numStr}` : numStr;
}

export default class SequenceModel extends BaseModel<typeof base_tb_sequence_rules> {
  constructor() {
    super(base_tb_sequence_rules);
  }

  private async getCountCount(ruleId: string): Promise<number> {
    const [row] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(base_tb_sequence_counts)
      .where(eq(base_tb_sequence_counts.ruleId, ruleId));

    return row?.count ?? 0;
  }

  /**
   * Get rule by ID with last 3 counts (RPC: base-sequence.curd.get)
   */
  get = async (params: { id: string }) => {
    const [rule] = await this.db
      .select()
      .from(base_tb_sequence_rules)
      .where(eq(base_tb_sequence_rules.id, params.id))
      .limit(1);

    if (!rule) return null;

    const counts = await this.db
      .select({
        value: base_tb_sequence_counts.value,
        createdAt: base_tb_sequence_counts.createdAt,
      })
      .from(base_tb_sequence_counts)
      .where(eq(base_tb_sequence_counts.ruleId, params.id))
      .orderBy(desc(base_tb_sequence_counts.createdAt))
      .limit(MAX_COUNTS_PER_RULE);

    return {
      id: rule.id,
      name: rule.name,
      prefix: rule.prefix ?? "",
      format: rule.format ?? "%06d",
      start: rule.start ?? 1,
      step: rule.step ?? 1,
      currentValue: Number(rule.currentValue ?? 0),
      isActive: rule.isActive ?? true,
      countCount: counts.length,
      counts: counts.map((c) => ({
        value: c.value,
        createdAt: c.createdAt?.getTime(),
      })),
      createdAt: rule.createdAt?.getTime(),
      updatedAt: rule.updatedAt?.getTime(),
    };
  };

  /**
   * Create rule (RPC: base-sequence.curd.create)
   * Chỉ system role mới có quyền - enforce tại API/middleware
   */
  create = async (params: SequenceRuleInput): Promise<SequenceRuleRow> => {
    if (!params.name?.trim()) throw new Error("Name is required");

    const [existing] = await this.db
      .select()
      .from(base_tb_sequence_rules)
      .where(eq(base_tb_sequence_rules.name, params.name.trim()))
      .limit(1);

    if (existing) throw new Error("Sequence rule with this name already exists");

    const [created] = await this.db
      .insert(base_tb_sequence_rules)
      .values({
        name: params.name.trim(),
        prefix: params.prefix ?? "",
        format: params.format ?? "%06d",
        start: params.start ?? 1,
        step: params.step ?? 1,
        currentValue: (params.start ?? 1) - (params.step ?? 1),
        isActive: true,
      })
      .returning();

    if (!created) throw new Error("Failed to create sequence rule");

    return {
      id: created.id,
      name: created.name,
      prefix: created.prefix ?? "",
      format: created.format ?? "%06d",
      start: created.start ?? 1,
      step: created.step ?? 1,
      currentValue: Number(created.currentValue ?? 0),
      isActive: created.isActive ?? true,
      countCount: 0,
      createdAt: created.createdAt?.getTime(),
      updatedAt: created.updatedAt?.getTime(),
    };
  };

  /**
   * Update rule (RPC: base-sequence.curd.update)
   * Nếu có count thì không cho edit - gợi ý inactive
   */
  update = async (params: {
    id: string;
    name?: string;
    prefix?: string;
    format?: string;
    start?: number;
    step?: number;
    isActive?: boolean;
  }): Promise<SequenceRuleRow | null> => {
    const countCount = await this.getCountCount(params.id);
    const isOnlyActiveUpdate =
      params.isActive !== undefined &&
      Object.keys(params).filter(
        (k) => k !== "id" && k !== "isActive" && params[k as keyof typeof params] !== undefined,
      ).length === 0;

    if (countCount > 0 && !isOnlyActiveUpdate) {
      throw new Error(
        "Cannot edit rule that has counts. You can only set it to inactive.",
      );
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (params.name !== undefined) updateData.name = params.name.trim();
    if (params.prefix !== undefined) updateData.prefix = params.prefix;
    if (params.format !== undefined) updateData.format = params.format;
    if (params.start !== undefined) updateData.start = params.start;
    if (params.step !== undefined) updateData.step = params.step;
    if (params.isActive !== undefined) updateData.isActive = params.isActive;

    const [updated] = await this.db
      .update(base_tb_sequence_rules)
      .set(updateData as any)
      .where(eq(base_tb_sequence_rules.id, params.id))
      .returning();

    if (!updated) return null;

    return {
      id: updated.id,
      name: updated.name,
      prefix: updated.prefix ?? "",
      format: updated.format ?? "%06d",
      start: updated.start ?? 1,
      step: updated.step ?? 1,
      currentValue: Number(updated.currentValue ?? 0),
      isActive: updated.isActive ?? true,
      countCount,
      createdAt: updated.createdAt?.getTime(),
      updatedAt: updated.updatedAt?.getTime(),
    };
  };

  /**
   * Delete rule (RPC: base-sequence.curd.delete)
   * Nếu có count thì không cho xóa - gợi ý inactive
   */
  delete = async (params: {
    id: string;
  }): Promise<{ success: boolean; message: string }> => {
    const countCount = await this.getCountCount(params.id);

    if (countCount > 0) {
      return {
        success: false,
        message: "Cannot delete rule that has counts. You can only set it to inactive.",
      };
    }

    await this.db
      .delete(base_tb_sequence_rules)
      .where(eq(base_tb_sequence_rules.id, params.id));

    return { success: true, message: "Sequence rule deleted successfully" };
  };

  /**
   * Get next value (RPC: base-sequence.curd.getNext)
   * Rule phải active mới sinh count mới
   */
  getNext = async (params: { name: string }): Promise<string> => {
    const [rule] = await this.db
      .select()
      .from(base_tb_sequence_rules)
      .where(eq(base_tb_sequence_rules.name, params.name))
      .limit(1);

    if (!rule) throw new Error(`Sequence rule "${params.name}" not found`);
    if (!rule.isActive) {
      throw new Error(
        `Sequence rule "${params.name}" is inactive. Cannot generate new count.`,
      );
    }

    return this.db.transaction(async (tx) => {
      const prefix = rule.prefix ?? "";
      const format = rule.format ?? "%06d";
      const step = rule.step ?? 1;
      const nextValue = Number(rule.currentValue ?? 0) + step;

      const [updated] = await tx
        .update(base_tb_sequence_rules)
        .set({
          currentValue: nextValue,
          updatedAt: new Date(),
        })
        .where(eq(base_tb_sequence_rules.id, rule.id))
        .returning({ currentValue: base_tb_sequence_rules.currentValue });

      const value = formatValue(prefix, format, nextValue);

      await tx.insert(base_tb_sequence_counts).values({
        ruleId: rule.id,
        value,
      });

      const toDelete = await tx
        .select({ id: base_tb_sequence_counts.id })
        .from(base_tb_sequence_counts)
        .where(eq(base_tb_sequence_counts.ruleId, rule.id))
        .orderBy(desc(base_tb_sequence_counts.createdAt))
        .offset(MAX_COUNTS_PER_RULE);

      if (toDelete.length > 0) {
        const ids = toDelete.map((r) => r.id);

        await tx
          .delete(base_tb_sequence_counts)
          .where(
            and(
              eq(base_tb_sequence_counts.ruleId, rule.id),
              inArray(base_tb_sequence_counts.id, ids),
            ),
          );
      }

      return value;
    });
  };

  /**
   * Clear excess counts - keep only 3 newest per rule (for cron job)
   */
  clearExcessCounts = async (): Promise<{ deleted: number }> => {
    const rules = await this.db.select({ id: base_tb_sequence_rules.id }).from(base_tb_sequence_rules);
    let totalDeleted = 0;

    for (const rule of rules) {
      const toDelete = await this.db
        .select({ id: base_tb_sequence_counts.id })
        .from(base_tb_sequence_counts)
        .where(eq(base_tb_sequence_counts.ruleId, rule.id))
        .orderBy(desc(base_tb_sequence_counts.createdAt))
        .offset(MAX_COUNTS_PER_RULE);

      if (toDelete.length > 0) {
        const ids = toDelete.map((r) => r.id);

        await this.db
          .delete(base_tb_sequence_counts)
          .where(
            and(
              eq(base_tb_sequence_counts.ruleId, rule.id),
              inArray(base_tb_sequence_counts.id, ids),
            ),
          );

        totalDeleted += toDelete.length;
      }
    }

    return { deleted: totalDeleted };
  };
}
