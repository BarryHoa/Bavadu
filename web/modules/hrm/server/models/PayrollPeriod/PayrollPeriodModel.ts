import { BaseModel } from "@base/server/models/BaseModel";
import { eq } from "drizzle-orm";

import { NewHrmTbPayrollPeriod, hrm_tb_payrolls_period } from "../../schemas";

export interface PayrollPeriodRow {
  id: string;
  code: string;
  name?: string | null;
  startDate: string;
  endDate: string;
  payDate: string;
  status: string;
  isLocked?: boolean;
  createdAt?: number;
  updatedAt?: number;
}

export interface PayrollPeriodInput {
  code: string;
  name?: string | null;
  startDate: string;
  endDate: string;
  payDate: string;
  status?: string;
  isLocked?: boolean;
}

export default class PayrollPeriodModel extends BaseModel<
  typeof hrm_tb_payrolls_period
> {
  constructor() {
    super(hrm_tb_payrolls_period);
  }

  getPayrollPeriodById = async (
    id: string,
  ): Promise<PayrollPeriodRow | null> => {
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
      name: row.name ?? undefined,
      startDate: row.startDate,
      endDate: row.endDate,
      payDate: row.payDate,
      status: row.status,
      isLocked: row.isLocked ?? undefined,
      createdAt: row.createdAt?.getTime(),
      updatedAt: row.updatedAt?.getTime(),
    };
  };

  getDataById = async (params: {
    id: string;
  }): Promise<PayrollPeriodRow | null> => {
    return this.getPayrollPeriodById(params.id);
  };

  createPayrollPeriod = async (
    payload: PayrollPeriodInput,
  ): Promise<PayrollPeriodRow> => {
    const now = new Date();
    const insertData: NewHrmTbPayrollPeriod = {
      code: payload.code,
      name: payload.name ?? null,
      startDate: payload.startDate,
      endDate: payload.endDate,
      payDate: payload.payDate,
      status: payload.status ?? "draft",
      isLocked: payload.isLocked ?? false,
      createdAt: now,
      updatedAt: now,
    };

    const [created] = await this.db
      .insert(this.table)
      .values(insertData)
      .returning({ id: this.table.id });

    if (!created) throw new Error("Failed to create payroll period");

    const period = await this.getPayrollPeriodById(created.id);

    if (!period)
      throw new Error("Failed to load payroll period after creation");

    return period;
  };

  updatePayrollPeriod = async (
    id: string,
    payload: Partial<PayrollPeriodInput>,
  ): Promise<PayrollPeriodRow | null> => {
    const updateData: Partial<typeof this.table.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (payload.code !== undefined) updateData.code = payload.code;
    if (payload.name !== undefined) updateData.name = payload.name ?? null;
    if (payload.startDate !== undefined)
      updateData.startDate = payload.startDate;
    if (payload.endDate !== undefined) updateData.endDate = payload.endDate;
    if (payload.payDate !== undefined) updateData.payDate = payload.payDate;
    if (payload.status !== undefined) updateData.status = payload.status;
    if (payload.isLocked !== undefined) updateData.isLocked = payload.isLocked;

    await this.db
      .update(this.table)
      .set(updateData)
      .where(eq(this.table.id, id));

    return this.getPayrollPeriodById(id);
  };

  updateData = async (params: { id: string; payload: any }) => {
    const { id, payload } = params;
    const normalizedPayload: Partial<PayrollPeriodInput> = {};

    if (payload.code !== undefined)
      normalizedPayload.code = String(payload.code);
    if (payload.name !== undefined) {
      normalizedPayload.name =
        payload.name === null || payload.name === ""
          ? null
          : String(payload.name);
    }
    if (payload.startDate !== undefined) {
      normalizedPayload.startDate = String(payload.startDate);
    }
    if (payload.endDate !== undefined) {
      normalizedPayload.endDate = String(payload.endDate);
    }
    if (payload.payDate !== undefined) {
      normalizedPayload.payDate = String(payload.payDate);
    }
    if (payload.status !== undefined) {
      normalizedPayload.status = String(payload.status);
    }
    if (payload.isLocked !== undefined) {
      normalizedPayload.isLocked = Boolean(payload.isLocked);
    }

    return this.updatePayrollPeriod(id, normalizedPayload);
  };
}
