import type { LocaleDataType } from "@base/server/interfaces/Locale";

export interface PayrollDto {
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
    fullName?: LocaleDataType<string>;
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

export interface CreatePayrollPayload {
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

export interface UpdatePayrollPayload extends Partial<CreatePayrollPayload> {
  id: string;
}

