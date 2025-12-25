import { LocaleDataType } from "@base/shared/interface/Locale";
import { BaseModel } from "@base/server/models/BaseModel";
import { eq } from "drizzle-orm";

import { NewHrmTbPayrollRule, hrm_tb_payrolls_rule } from "../../schemas";

export interface PayrollRuleRow {
  id: string;
  code: string;
  name?: unknown;
  description?: unknown;
  ruleType: string;
  ruleConfig?: unknown;
  effectiveDate: string;
  expiryDate?: string | null;
  isActive?: boolean;
  createdAt?: number;
  updatedAt?: number;
}

export interface PayrollRuleInput {
  code: string;
  name: LocaleDataType<string>;
  description?: LocaleDataType<string> | null;
  ruleType: string;
  ruleConfig: unknown;
  effectiveDate: string;
  expiryDate?: string | null;
  isActive?: boolean;
}

export default class PayrollRuleModel extends BaseModel<
  typeof hrm_tb_payrolls_rule
> {
  constructor() {
    super(hrm_tb_payrolls_rule);
  }

  private normalizeLocaleInput(value: unknown): LocaleDataType<string> | null {
    if (!value) return null;
    if (typeof value === "string") return { en: value };
    if (typeof value === "object") return value as LocaleDataType<string>;

    return null;
  }

  getPayrollRuleById = async (id: string): Promise<PayrollRuleRow | null> => {
    const result = await this.db
      .select()
      .from(this.table)
      .where(eq(this.table.id, id))
      .limit(1);

    const row = result[0];

    if (!row) return null;

    return {
      id: row.id,
      code: row.code,
      name: row.name,
      description: row.description,
      ruleType: row.ruleType,
      ruleConfig: row.ruleConfig,
      effectiveDate: row.effectiveDate,
      expiryDate: row.expiryDate ?? undefined,
      isActive: row.isActive ?? undefined,
      createdAt: row.createdAt?.getTime(),
      updatedAt: row.updatedAt?.getTime(),
    };
  };

  getDataById = async (params: {
    id: string;
  }): Promise<PayrollRuleRow | null> => {
    return this.getPayrollRuleById(params.id);
  };

  createPayrollRule = async (
    payload: PayrollRuleInput,
  ): Promise<PayrollRuleRow> => {
    const now = new Date();
    const insertData: NewHrmTbPayrollRule = {
      code: payload.code,
      name: payload.name,
      description: payload.description
        ? typeof payload.description === "string"
          ? payload.description
          : JSON.stringify(payload.description)
        : null,
      ruleType: payload.ruleType,
      ruleConfig: payload.ruleConfig,
      effectiveDate: payload.effectiveDate,
      expiryDate: payload.expiryDate ?? null,
      isActive: payload.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };

    const [created] = await this.db
      .insert(this.table)
      .values(insertData)
      .returning({ id: this.table.id });

    if (!created) throw new Error("Failed to create payroll rule");

    const rule = await this.getPayrollRuleById(created.id);

    if (!rule) throw new Error("Failed to load payroll rule after creation");

    return rule;
  };

  updatePayrollRule = async (
    id: string,
    payload: Partial<PayrollRuleInput>,
  ): Promise<PayrollRuleRow | null> => {
    const updateData: Partial<typeof this.table.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (payload.code !== undefined) updateData.code = payload.code;
    if (payload.name !== undefined) updateData.name = payload.name;
    if (payload.description !== undefined)
      updateData.description = payload.description
        ? typeof payload.description === "string"
          ? payload.description
          : JSON.stringify(payload.description)
        : null;
    if (payload.ruleType !== undefined) updateData.ruleType = payload.ruleType;
    if (payload.ruleConfig !== undefined)
      updateData.ruleConfig = payload.ruleConfig;
    if (payload.effectiveDate !== undefined)
      updateData.effectiveDate = payload.effectiveDate;
    if (payload.expiryDate !== undefined)
      updateData.expiryDate = payload.expiryDate ?? null;
    if (payload.isActive !== undefined) updateData.isActive = payload.isActive;

    await this.db
      .update(this.table)
      .set(updateData)
      .where(eq(this.table.id, id));

    return this.getPayrollRuleById(id);
  };

  updateData = async (params: { id: string; payload: any }) => {
    const { id, payload } = params;
    const normalizedPayload: Partial<PayrollRuleInput> = {};

    if (payload.code !== undefined) {
      normalizedPayload.code = String(payload.code);
    }
    if (payload.name !== undefined) {
      normalizedPayload.name = this.normalizeLocaleInput(payload.name) ?? {
        en: "",
      };
    }
    if (payload.description !== undefined) {
      normalizedPayload.description = this.normalizeLocaleInput(
        payload.description,
      );
    }
    if (payload.ruleType !== undefined) {
      normalizedPayload.ruleType = String(payload.ruleType);
    }
    if (payload.ruleConfig !== undefined) {
      normalizedPayload.ruleConfig = payload.ruleConfig;
    }
    if (payload.effectiveDate !== undefined) {
      normalizedPayload.effectiveDate = String(payload.effectiveDate);
    }
    if (payload.expiryDate !== undefined) {
      normalizedPayload.expiryDate =
        payload.expiryDate === null || payload.expiryDate === ""
          ? null
          : String(payload.expiryDate);
    }
    if (payload.isActive !== undefined) {
      normalizedPayload.isActive = Boolean(payload.isActive);
    }

    return this.updatePayrollRule(id, normalizedPayload);
  };
}
