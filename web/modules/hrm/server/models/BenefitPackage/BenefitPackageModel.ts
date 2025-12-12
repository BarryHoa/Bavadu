import { LocaleDataType } from "@base/server/interfaces/Locale";
import { BaseModel } from "@base/server/models/BaseModel";
import { eq } from "drizzle-orm";

import { NewTblBenefitPackage, table_benefit_package } from "../../schemas";

export interface BenefitPackageRow {
  id: string;
  code: string;
  name?: unknown;
  description?: unknown;
  benefitType: string;
  coverage?: unknown;
  cost?: number | null;
  currency?: string | null;
  isActive?: boolean;
  createdAt?: number;
  updatedAt?: number;
}

export interface BenefitPackageInput {
  code: string;
  name: LocaleDataType<string>;
  description?: LocaleDataType<string> | null;
  benefitType: string;
  coverage?: unknown;
  cost?: number | null;
  currency?: string | null;
  isActive?: boolean;
}

export default class BenefitPackageModel extends BaseModel<
  typeof table_benefit_package
> {
  constructor() {
    super(table_benefit_package);
  }

  private normalizeLocaleInput(value: unknown): LocaleDataType<string> | null {
    if (!value) return null;
    if (typeof value === "string") return { en: value };
    if (typeof value === "object") return value as LocaleDataType<string>;
    return null;
  }

  getBenefitPackageById = async (
    id: string
  ): Promise<BenefitPackageRow | null> => {
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
      benefitType: row.benefitType,
      coverage: row.coverage,
      cost: row.cost ?? undefined,
      currency: row.currency ?? undefined,
      isActive: row.isActive ?? undefined,
      createdAt: row.createdAt?.getTime(),
      updatedAt: row.updatedAt?.getTime(),
    };
  };

  getDataById = async (params: {
    id: string;
  }): Promise<BenefitPackageRow | null> => {
    return this.getBenefitPackageById(params.id);
  };

  createBenefitPackage = async (
    payload: BenefitPackageInput
  ): Promise<BenefitPackageRow> => {
    const now = new Date();
    const insertData: NewTblBenefitPackage = {
      code: payload.code,
      name: payload.name,
      description: payload.description ?? null,
      benefitType: payload.benefitType,
      coverage: payload.coverage ?? null,
      cost: payload.cost ?? null,
      currency: payload.currency ?? "VND",
      isActive: payload.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };

    const [created] = await this.db
      .insert(this.table)
      .values(insertData)
      .returning({ id: this.table.id });

    if (!created) throw new Error("Failed to create benefit package");

    const benefitPackage = await this.getBenefitPackageById(created.id);
    if (!benefitPackage)
      throw new Error("Failed to load benefit package after creation");
    return benefitPackage;
  };

  updateBenefitPackage = async (
    id: string,
    payload: Partial<BenefitPackageInput>
  ): Promise<BenefitPackageRow | null> => {
    const updateData: Partial<typeof this.table.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (payload.code !== undefined) updateData.code = payload.code;
    if (payload.name !== undefined) updateData.name = payload.name;
    if (payload.description !== undefined)
      updateData.description = payload.description ?? null;
    if (payload.benefitType !== undefined)
      updateData.benefitType = payload.benefitType;
    if (payload.coverage !== undefined)
      updateData.coverage = payload.coverage ?? null;
    if (payload.cost !== undefined) updateData.cost = payload.cost ?? null;
    if (payload.currency !== undefined)
      updateData.currency = payload.currency ?? null;
    if (payload.isActive !== undefined) updateData.isActive = payload.isActive;

    await this.db
      .update(this.table)
      .set(updateData)
      .where(eq(this.table.id, id));
    return this.getBenefitPackageById(id);
  };

  updateData = async (params: { id: string; payload: any }) => {
    const { id, payload } = params;
    const normalizedPayload: Partial<BenefitPackageInput> = {};

    if (payload.code !== undefined) {
      normalizedPayload.code = String(payload.code);
    }
    if (payload.name !== undefined) {
      normalizedPayload.name = this.normalizeLocaleInput(payload.name) ?? { en: "" };
    }
    if (payload.description !== undefined) {
      normalizedPayload.description = this.normalizeLocaleInput(
        payload.description
      );
    }
    if (payload.benefitType !== undefined) {
      normalizedPayload.benefitType = String(payload.benefitType);
    }
    if (payload.coverage !== undefined) {
      normalizedPayload.coverage = payload.coverage;
    }
    if (payload.cost !== undefined) {
      normalizedPayload.cost =
        payload.cost === null || payload.cost === "" ? null : Number(payload.cost);
    }
    if (payload.currency !== undefined) {
      normalizedPayload.currency =
        payload.currency === null || payload.currency === "" ? null : String(payload.currency);
    }
    if (payload.isActive !== undefined) {
      normalizedPayload.isActive = Boolean(payload.isActive);
    }

    return this.updateBenefitPackage(id, normalizedPayload);
  };
}

