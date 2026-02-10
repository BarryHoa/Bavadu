import {
  minLength,
  minValue,
  number,
  object,
  optional,
  pipe,
  string,
  trim,
  type InferOutput,
} from "valibot";

type TranslateFn = (key: string, values?: Record<string, any>) => string;

export function createPayrollValidation(t: TranslateFn) {
  const payrollFormSchema = object({
    payrollPeriodId: pipe(
      string(),
      trim(),
      minLength(1, t("payrollPeriodId.required")),
    ),
    employeeId: pipe(string(), trim(), minLength(1, t("employeeId.required"))),
    baseSalary: pipe(number(), minValue(0, t("baseSalary.invalid"))),
    overtimePay: optional(
      pipe(number(), minValue(0, t("overtimePay.invalid"))),
    ),
    bonuses: optional(pipe(number(), minValue(0, t("bonuses.invalid")))),
    otherEarnings: optional(
      pipe(number(), minValue(0, t("otherEarnings.invalid"))),
    ),
    socialInsurance: optional(
      pipe(number(), minValue(0, t("socialInsurance.invalid"))),
    ),
    healthInsurance: optional(
      pipe(number(), minValue(0, t("healthInsurance.invalid"))),
    ),
    unemploymentInsurance: optional(
      pipe(number(), minValue(0, t("unemploymentInsurance.invalid"))),
    ),
    personalIncomeTax: optional(
      pipe(number(), minValue(0, t("personalIncomeTax.invalid"))),
    ),
    workingDays: optional(
      pipe(number(), minValue(0, t("workingDays.invalid"))),
    ),
    workingHours: optional(
      pipe(number(), minValue(0, t("workingHours.invalid"))),
    ),
    overtimeHours: optional(
      pipe(number(), minValue(0, t("overtimeHours.invalid"))),
    ),
    status: optional(pipe(string(), trim())),
    notes: optional(pipe(string(), trim())),
  });

  return {
    payrollFormSchema,
  };
}

export type PayrollFormValues = InferOutput<
  ReturnType<typeof createPayrollValidation>["payrollFormSchema"]
>;
