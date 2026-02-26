import type {
  ListParamsRequest,
  ListParamsResponse,
} from "@base/shared/interface/ListInterface";
import type { SequenceRuleRow } from "./SequenceModel";

import { eq, ilike, sql } from "drizzle-orm";

import {
  BaseViewListModel,
  type ColumnMap,
  type FilterConditionMap,
  type SearchConditionMap,
} from "@base/server/models/BaseViewListModel";
import { ParamFilter } from "@base/shared/interface/FilterInterface";

import { base_tb_sequence_rules } from "../../schemas/base.sequence-rule";


class SequenceViewListModel extends BaseViewListModel<
  typeof base_tb_sequence_rules,
  SequenceRuleRow
> {
  constructor() {
    super({
      table: base_tb_sequence_rules,
      sortDefault: [{ column: "createdAt", direction: "descending" }],
    });
  }

  protected declarationColumns = (): ColumnMap =>
    new Map([
      ["id", { column: base_tb_sequence_rules.id, sort: false }],
      ["name", { column: base_tb_sequence_rules.name, sort: true }],
      ["prefix", { column: base_tb_sequence_rules.prefix, sort: true }],
      ["format", { column: base_tb_sequence_rules.format, sort: true }],
      ["start", { column: base_tb_sequence_rules.start, sort: true }],
      ["step", { column: base_tb_sequence_rules.step, sort: true }],
      [
        "currentValue",
        { column: base_tb_sequence_rules.currentValue, sort: true },
      ],
      ["isActive", { column: base_tb_sequence_rules.isActive, sort: true }],
      ["createdAt", { column: base_tb_sequence_rules.createdAt, sort: true }],
      ["updatedAt", { column: base_tb_sequence_rules.updatedAt, sort: true }],
    ]);

  protected declarationSearch = (): SearchConditionMap =>
    new Map([
      [
        "name",
        (text: string) =>
          text ? ilike(base_tb_sequence_rules.name, `%${text}%`) : undefined,
      ],
      [
        "prefix",
        (text: string) =>
          text ? ilike(base_tb_sequence_rules.prefix, `%${text}%`) : undefined,
      ],
    ]);

  protected declarationFilter = (): FilterConditionMap<ParamFilter> =>
    new Map([
      [
        "isActive",
        (value?: unknown) =>
          typeof value === "boolean"
            ? eq(base_tb_sequence_rules.isActive, value)
            : undefined,
      ],
    ]);

  protected declarationMappingData = (row: any): SequenceRuleRow => ({
    id: row.id,
    name: row.name,
    prefix: row.prefix ?? "",
    format: row.format ?? "%06d",
    start: row.start ?? 1,
    step: row.step ?? 1,
    currentValue: Number(row.currentValue ?? 0),
    isActive: row.isActive ?? undefined,
    countCount: row.countCount ?? 0,
    createdAt: row.createdAt?.getTime(),
    updatedAt: row.updatedAt?.getTime(),
  });

  @BaseViewListModel.Auth({ required: true, permissions: ["base.sequence.view"] })
  getData = async (
    params: ListParamsRequest,
  ): Promise<ListParamsResponse<SequenceRuleRow>> => {
    const countSubquery = sql<number>`(
      SELECT count(*)::int FROM "md_base"."sequence_counts" sc
      WHERE sc.rule_id = "md_base"."sequence_rules".id
    )`.as("countCount");

    const selectWithCount = {
      ...base_tb_sequence_rules,
      countCount: countSubquery,
    };

    return this.buildQueryDataListWithSelect(params, selectWithCount as any);
  };
}

export default SequenceViewListModel;
