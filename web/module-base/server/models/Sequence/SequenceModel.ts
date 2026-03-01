import { and, desc, eq, inArray, sql } from "drizzle-orm";

import { BaseModel, PermissionRequired } from "@base/server/models/BaseModel";

import { JSON_RPC_ERROR_CODES, JsonRpcError } from "../../rpc/jsonRpcHandler";
import { base_tb_sequence_counts, base_tb_sequence_rules } from "../../schemas";

export interface SequenceRuleRow {
  id: string;
  code: string;
  name?: string;
  prefix: string;
  suffix: string;
  description?: string;
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
  code: string;
  name?: string;
  prefix?: string;
  suffix?: string;
  description?: string;
  format?: string;
  start?: number;
  step?: number;
}

const MAX_COUNTS_PER_RULE = 3;

function formatValue(
  prefix: string,
  format: string,
  value: number,
  suffix: string,
): string {
  const match = format.match(/%0?(\d+)d/);
  const width = match ? parseInt(match[1], 10) : 6;
  const numStr = String(value).padStart(width, "0");

  return `${prefix ? `${prefix}-` : ""}${numStr}${suffix ? `-${suffix}` : ""}`;
}

export default class SequenceModel extends BaseModel<
  typeof base_tb_sequence_rules
> {
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
      code: rule.code,
      name: rule.name ?? undefined,
      prefix: rule.prefix ?? "",
      suffix: rule.suffix ?? "",
      description: rule.description ?? undefined,
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
   */
  @PermissionRequired({ auth: true, permissions: ["base.sequence.create"] })
  create = async (params: SequenceRuleInput): Promise<SequenceRuleRow> => {
    const codeTrim = params.code?.trim();
    if (!codeTrim) throw new Error("Code is required");

    const [existing] = await this.db
      .select()
      .from(base_tb_sequence_rules)
      .where(eq(base_tb_sequence_rules.code, codeTrim))
      .limit(1);

    if (existing)
      throw new JsonRpcError(
        JSON_RPC_ERROR_CODES.VALIDATION_ERROR,
        "Sequence rule with this code already exists",
      );

    const [created] = await this.db
      .insert(base_tb_sequence_rules)
      .values({
        code: codeTrim,
        name: params.name?.trim(),
        prefix: params.prefix,
        suffix: params.suffix,
        description: params.description?.trim(),
        format: params.format,
        start: params.start ?? 1,
        step: params.step ?? 1,
        currentValue: (params.start ?? 1) - (params.step ?? 1),
        isActive: true,
      })
      .returning();

    if (!created)
      throw new JsonRpcError(
        JSON_RPC_ERROR_CODES.INTERNAL_ERROR,
        "Failed to create sequence rule",
      );

    return {
      id: created.id,
      code: created.code,
      name: created.name ?? undefined,
      prefix: created.prefix ?? "",
      suffix: created.suffix ?? "",
      description: created.description ?? undefined,
      format: created.format ?? "%06d",
      start: created.start ?? 1,
      step: created.step ?? 1,
      currentValue: Number(created.currentValue ?? 0),
      countCount: 0,
      createdAt: created.createdAt?.getTime(),
      updatedAt: created.updatedAt?.getTime(),
    };
  };

  /**
   * Update rule (RPC: base-sequence.curd.update)
   * Nếu có count thì chỉ cho đổi isActive, name, description
   */
  update = async (params: {
    id: string;
    code?: string;
    name?: string;
    prefix?: string;
    suffix?: string;
    description?: string;
    format?: string;
    start?: number;
    step?: number;
    isActive?: boolean;
  }): Promise<SequenceRuleRow | null> => {
    const countCount = await this.getCountCount(params.id);
    const onlySafeUpdate =
      countCount > 0 &&
      Object.keys(params).every(
        (k) =>
          k === "id" ||
          k === "isActive" ||
          k === "name" ||
          k === "description" ||
          params[k as keyof typeof params] === undefined,
      );

    if (countCount > 0 && !onlySafeUpdate) {
      throw new Error(
        "Cannot edit rule that has counts. You can only change status, name or description.",
      );
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (params.code !== undefined) updateData.code = params.code.trim();
    if (params.name !== undefined)
      updateData.name = params.name?.trim() || null;
    if (params.prefix !== undefined) updateData.prefix = params.prefix;
    if (params.suffix !== undefined) updateData.suffix = params.suffix;
    if (params.description !== undefined)
      updateData.description = params.description?.trim() || null;
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
      code: updated.code,
      name: updated.name ?? undefined,
      prefix: updated.prefix ?? "",
      suffix: updated.suffix ?? "",
      description: updated.description ?? undefined,
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
   */
  delete = async (params: {
    id: string;
  }): Promise<{ success: boolean; message: string }> => {
    const countCount = await this.getCountCount(params.id);

    if (countCount > 0) {
      return {
        success: false,
        message:
          "Cannot delete rule that has counts. You can only set it to inactive.",
      };
    }

    await this.db
      .delete(base_tb_sequence_rules)
      .where(eq(base_tb_sequence_rules.id, params.id));

    return { success: true, message: "Sequence rule deleted successfully" };
  };

  /**
   * Get next value (RPC: base-sequence.curd.getNext)
   * Lookup by code. Rule phải active mới sinh count mới.
   */
  getNext = async (params: { code: string }): Promise<string> => {
    const [rule] = await this.db
      .select()
      .from(base_tb_sequence_rules)
      .where(eq(base_tb_sequence_rules.code, params.code))
      .limit(1);

    if (!rule)
      throw new Error(`Sequence rule with code "${params.code}" not found`);
    if (!rule.isActive) {
      throw new Error(
        `Sequence rule "${params.code}" is inactive. Cannot generate new count.`,
      );
    }

    return this.db.transaction(async (tx) => {
      const prefix = rule.prefix ?? "";
      const suffix = rule.suffix ?? "";
      const format = rule.format ?? "%06d";
      const step = rule.step ?? 1;
      const nextValue = Number(rule.currentValue ?? 0) + step;

      await tx
        .update(base_tb_sequence_rules)
        .set({
          currentValue: nextValue,
          updatedAt: new Date(),
        })
        .where(eq(base_tb_sequence_rules.id, rule.id));

      const value = formatValue(prefix, format, nextValue, suffix);

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
    const rules = await this.db
      .select({ id: base_tb_sequence_rules.id })
      .from(base_tb_sequence_rules);
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
