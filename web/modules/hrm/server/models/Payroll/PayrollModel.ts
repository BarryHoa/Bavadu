import { BaseModel } from "@base/server/models/BaseModel";
import { eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { NewHrmTbPayroll, hrm_tb_payrolls } from "../../schemas";
import { hrm_tb_employees } from "../../schemas/hrm.employee";
import { hrm_tb_payrolls_period } from "../../schemas/hrm.payroll-period";

const employee = alias(hrm_tb_employees, "employee");
const period = alias(hrm_tb_payrolls_period, "period");

export interface PayrollRow {
  id: string;
  payrollPeriodId: string;
  payrollPeriod?: {
    id: string;
    code?: string;
    name?: string | null;
  } | null;
  employeeId: string;
  employee?: {
    id: string;
    employeeCode?: string;
    fullName?: unknown;
  } | null;
  baseSalary: number;
  allowances?: Record<string, number>;
  overtimePay: number;
  bonuses: number;
  otherEarnings: number;
  grossSalary: number;
  socialInsurance: number;
  healthInsurance: number;
  unemploymentInsurance: number;
  personalIncomeTax: number;
  otherDeductions?: Record<string, number>;
  totalDeductions: number;
  netSalary: number;
  workingDays: number;
  workingHours: number;
  overtimeHours: number;
  status: string;
  notes?: string | null;
  createdAt?: number;
  updatedAt?: number;
}

export interface PayrollInput {
  payrollPeriodId: string;
  employeeId: string;
  baseSalary: number;
  allowances?: Record<string, number>;
  overtimePay?: number;
  bonuses?: number;
  otherEarnings?: number;
  socialInsurance?: number;
  healthInsurance?: number;
  unemploymentInsurance?: number;
  personalIncomeTax?: number;
  otherDeductions?: Record<string, number>;
  workingDays?: number;
  workingHours?: number;
  overtimeHours?: number;
  status?: string;
  notes?: string | null;
}

export default class PayrollModel extends BaseModel<typeof hrm_tb_payrolls> {
  constructor() {
    super(hrm_tb_payrolls);
  }

  getPayrollById = async (id: string): Promise<PayrollRow | null> => {
    const result = await this.db
      .select({
        id: this.table.id,
        payrollPeriodId: this.table.payrollPeriodId,
        periodCode: period.code,
        periodName: period.name,
        employeeId: this.table.employeeId,
        employeeCode: employee.employeeCode,
        employeeFullName: employee.fullName,
        baseSalary: this.table.baseSalary,
        allowances: this.table.allowances,
        overtimePay: this.table.overtimePay,
        bonuses: this.table.bonuses,
        otherEarnings: this.table.otherEarnings,
        grossSalary: this.table.grossSalary,
        socialInsurance: this.table.socialInsurance,
        healthInsurance: this.table.healthInsurance,
        unemploymentInsurance: this.table.unemploymentInsurance,
        personalIncomeTax: this.table.personalIncomeTax,
        otherDeductions: this.table.otherDeductions,
        totalDeductions: this.table.totalDeductions,
        netSalary: this.table.netSalary,
        workingDays: this.table.workingDays,
        workingHours: this.table.workingHours,
        overtimeHours: this.table.overtimeHours,
        status: this.table.status,
        notes: this.table.notes,
        createdAt: this.table.createdAt,
        updatedAt: this.table.updatedAt,
      })
      .from(this.table)
      .leftJoin(period, eq(this.table.payrollPeriodId, period.id))
      .leftJoin(employee, eq(this.table.employeeId, employee.id))
      .where(eq(this.table.id, id))
      .limit(1);

    const row = result[0];

    if (!row) return null;

    return {
      id: row.id,
      payrollPeriodId: row.payrollPeriodId,
      payrollPeriod: row.payrollPeriodId
        ? {
            id: row.payrollPeriodId,
            code: row.periodCode ?? undefined,
            name: row.periodName ?? undefined,
          }
        : null,
      employeeId: row.employeeId,
      employee: row.employeeId
        ? {
            id: row.employeeId,
            employeeCode: row.employeeCode ?? undefined,
            fullName: row.employeeFullName ?? undefined,
          }
        : null,
      baseSalary: row.baseSalary,
      allowances: (row.allowances as Record<string, number>) ?? undefined,
      overtimePay: row.overtimePay ?? 0,
      bonuses: row.bonuses ?? 0,
      otherEarnings: row.otherEarnings ?? 0,
      grossSalary: row.grossSalary,
      socialInsurance: row.socialInsurance ?? 0,
      healthInsurance: row.healthInsurance ?? 0,
      unemploymentInsurance: row.unemploymentInsurance ?? 0,
      personalIncomeTax: row.personalIncomeTax ?? 0,
      otherDeductions:
        (row.otherDeductions as Record<string, number>) ?? undefined,
      totalDeductions: row.totalDeductions ?? 0,
      netSalary: row.netSalary,
      workingDays: row.workingDays ?? 0,
      workingHours: row.workingHours ?? 0,
      overtimeHours: row.overtimeHours ?? 0,
      status: row.status,
      notes: row.notes ?? undefined,
      createdAt: row.createdAt?.getTime(),
      updatedAt: row.updatedAt?.getTime(),
    };
  };

  getDataById = async (params: { id: string }): Promise<PayrollRow | null> => {
    return this.getPayrollById(params.id);
  };

  createPayroll = async (payload: PayrollInput): Promise<PayrollRow> => {
    const now = new Date();

    // Calculate totals
    const allowancesTotal = payload.allowances
      ? Object.values(payload.allowances).reduce((sum, val) => sum + val, 0)
      : 0;
    const otherDeductionsTotal = payload.otherDeductions
      ? Object.values(payload.otherDeductions).reduce(
          (sum, val) => sum + val,
          0,
        )
      : 0;

    const grossSalary =
      payload.baseSalary +
      allowancesTotal +
      (payload.overtimePay ?? 0) +
      (payload.bonuses ?? 0) +
      (payload.otherEarnings ?? 0);

    const totalDeductions =
      (payload.socialInsurance ?? 0) +
      (payload.healthInsurance ?? 0) +
      (payload.unemploymentInsurance ?? 0) +
      (payload.personalIncomeTax ?? 0) +
      otherDeductionsTotal;

    const netSalary = grossSalary - totalDeductions;

    const insertData: NewHrmTbPayroll = {
      payrollPeriodId: payload.payrollPeriodId,
      employeeId: payload.employeeId,
      baseSalary: payload.baseSalary,
      allowances: payload.allowances ?? null,
      overtimePay: payload.overtimePay ?? 0,
      bonuses: payload.bonuses ?? 0,
      otherEarnings: payload.otherEarnings ?? 0,
      grossSalary: grossSalary,
      socialInsurance: payload.socialInsurance ?? 0,
      healthInsurance: payload.healthInsurance ?? 0,
      unemploymentInsurance: payload.unemploymentInsurance ?? 0,
      personalIncomeTax: payload.personalIncomeTax ?? 0,
      otherDeductions: payload.otherDeductions ?? null,
      totalDeductions: totalDeductions,
      netSalary: netSalary,
      workingDays: payload.workingDays ?? 0,
      workingHours: payload.workingHours ?? 0,
      overtimeHours: payload.overtimeHours ?? 0,
      status: payload.status ?? "draft",
      notes: payload.notes ?? null,
      createdAt: now,
      updatedAt: now,
    };

    const [created] = await this.db
      .insert(this.table)
      .values(insertData)
      .returning({ id: this.table.id });

    if (!created) throw new Error("Failed to create payroll");

    const payroll = await this.getPayrollById(created.id);

    if (!payroll) throw new Error("Failed to load payroll after creation");

    return payroll;
  };

  updatePayroll = async (
    id: string,
    payload: Partial<PayrollInput>,
  ): Promise<PayrollRow | null> => {
    const updateData: Partial<typeof this.table.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (payload.payrollPeriodId !== undefined)
      updateData.payrollPeriodId = payload.payrollPeriodId;
    if (payload.employeeId !== undefined)
      updateData.employeeId = payload.employeeId;
    if (payload.baseSalary !== undefined)
      updateData.baseSalary = payload.baseSalary;
    if (payload.allowances !== undefined)
      updateData.allowances = payload.allowances ?? null;
    if (payload.overtimePay !== undefined)
      updateData.overtimePay = payload.overtimePay;
    if (payload.bonuses !== undefined) updateData.bonuses = payload.bonuses;
    if (payload.otherEarnings !== undefined)
      updateData.otherEarnings = payload.otherEarnings;
    if (payload.socialInsurance !== undefined)
      updateData.socialInsurance = payload.socialInsurance;
    if (payload.healthInsurance !== undefined)
      updateData.healthInsurance = payload.healthInsurance;
    if (payload.unemploymentInsurance !== undefined)
      updateData.unemploymentInsurance = payload.unemploymentInsurance;
    if (payload.personalIncomeTax !== undefined)
      updateData.personalIncomeTax = payload.personalIncomeTax;
    if (payload.otherDeductions !== undefined)
      updateData.otherDeductions = payload.otherDeductions ?? null;
    if (payload.workingDays !== undefined)
      updateData.workingDays = payload.workingDays;
    if (payload.workingHours !== undefined)
      updateData.workingHours = payload.workingHours;
    if (payload.overtimeHours !== undefined)
      updateData.overtimeHours = payload.overtimeHours;
    if (payload.status !== undefined) updateData.status = payload.status;
    if (payload.notes !== undefined) updateData.notes = payload.notes ?? null;

    // Recalculate totals if earnings/deductions changed
    if (
      payload.baseSalary !== undefined ||
      payload.allowances !== undefined ||
      payload.overtimePay !== undefined ||
      payload.bonuses !== undefined ||
      payload.otherEarnings !== undefined ||
      payload.socialInsurance !== undefined ||
      payload.healthInsurance !== undefined ||
      payload.unemploymentInsurance !== undefined ||
      payload.personalIncomeTax !== undefined ||
      payload.otherDeductions !== undefined
    ) {
      const existing = await this.getPayrollById(id);

      if (existing) {
        const baseSalary = updateData.baseSalary ?? existing.baseSalary;
        const allowances = (updateData.allowances ?? existing.allowances) as
          | Record<string, number>
          | undefined;
        const allowancesTotal = allowances
          ? Object.values(allowances).reduce((sum, val) => sum + val, 0)
          : 0;
        const overtimePay = updateData.overtimePay ?? existing.overtimePay ?? 0;
        const bonuses = updateData.bonuses ?? existing.bonuses ?? 0;
        const otherEarnings =
          updateData.otherEarnings ?? existing.otherEarnings ?? 0;

        const grossSalary =
          baseSalary + allowancesTotal + overtimePay + bonuses + otherEarnings;

        const socialInsurance =
          updateData.socialInsurance ?? existing.socialInsurance ?? 0;
        const healthInsurance =
          updateData.healthInsurance ?? existing.healthInsurance ?? 0;
        const unemploymentInsurance =
          updateData.unemploymentInsurance ??
          existing.unemploymentInsurance ??
          0;
        const personalIncomeTax =
          updateData.personalIncomeTax ?? existing.personalIncomeTax ?? 0;
        const otherDeductions = (updateData.otherDeductions ??
          existing.otherDeductions) as Record<string, number> | undefined;
        const otherDeductionsTotal = otherDeductions
          ? Object.values(otherDeductions).reduce((sum, val) => sum + val, 0)
          : 0;

        const totalDeductions =
          socialInsurance +
          healthInsurance +
          unemploymentInsurance +
          personalIncomeTax +
          otherDeductionsTotal;
        const netSalary = grossSalary - totalDeductions;

        updateData.grossSalary = grossSalary;
        updateData.totalDeductions = totalDeductions;
        updateData.netSalary = netSalary;
      }
    }

    await this.db
      .update(this.table)
      .set(updateData)
      .where(eq(this.table.id, id));

    return this.getPayrollById(id);
  };

  updateData = async (params: { id: string; payload: any }) => {
    const { id, payload } = params;
    const normalizedPayload: Partial<PayrollInput> = {};

    if (payload.payrollPeriodId !== undefined) {
      normalizedPayload.payrollPeriodId = String(payload.payrollPeriodId);
    }
    if (payload.employeeId !== undefined) {
      normalizedPayload.employeeId = String(payload.employeeId);
    }
    if (payload.baseSalary !== undefined) {
      normalizedPayload.baseSalary = Number(payload.baseSalary);
    }
    if (payload.allowances !== undefined) {
      normalizedPayload.allowances = payload.allowances;
    }
    if (payload.overtimePay !== undefined) {
      normalizedPayload.overtimePay = Number(payload.overtimePay);
    }
    if (payload.bonuses !== undefined) {
      normalizedPayload.bonuses = Number(payload.bonuses);
    }
    if (payload.otherEarnings !== undefined) {
      normalizedPayload.otherEarnings = Number(payload.otherEarnings);
    }
    if (payload.socialInsurance !== undefined) {
      normalizedPayload.socialInsurance = Number(payload.socialInsurance);
    }
    if (payload.healthInsurance !== undefined) {
      normalizedPayload.healthInsurance = Number(payload.healthInsurance);
    }
    if (payload.unemploymentInsurance !== undefined) {
      normalizedPayload.unemploymentInsurance = Number(
        payload.unemploymentInsurance,
      );
    }
    if (payload.personalIncomeTax !== undefined) {
      normalizedPayload.personalIncomeTax = Number(payload.personalIncomeTax);
    }
    if (payload.otherDeductions !== undefined) {
      normalizedPayload.otherDeductions = payload.otherDeductions;
    }
    if (payload.workingDays !== undefined) {
      normalizedPayload.workingDays = Number(payload.workingDays);
    }
    if (payload.workingHours !== undefined) {
      normalizedPayload.workingHours = Number(payload.workingHours);
    }
    if (payload.overtimeHours !== undefined) {
      normalizedPayload.overtimeHours = Number(payload.overtimeHours);
    }
    if (payload.status !== undefined) {
      normalizedPayload.status = String(payload.status);
    }
    if (payload.notes !== undefined) {
      normalizedPayload.notes =
        payload.notes === null || payload.notes === ""
          ? null
          : String(payload.notes);
    }

    return this.updatePayroll(id, normalizedPayload);
  };
}
