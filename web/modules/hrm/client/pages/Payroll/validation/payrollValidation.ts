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
      minLength(1, t("validation.payrollPeriodId.required"))
    ),
    employeeId: pipe(
      string(),
      trim(),
      minLength(1, t("validation.employeeId.required"))
    ),
    baseSalary: pipe(
      number(),
      minValue(0, t("validation.baseSalary.invalid"))
    ),
    overtimePay: optional(
      pipe(
        number(),
        minValue(0, t("validation.overtimePay.invalid"))
      )
    ),
    bonuses: optional(
      pipe(
        number(),
        minValue(0, t("validation.bonuses.invalid"))
      )
    ),
    otherEarnings: optional(
      pipe(
        number(),
        minValue(0, t("validation.otherEarnings.invalid"))
      )
    ),
    socialInsurance: optional(
      pipe(
        number(),
        minValue(0, t("validation.socialInsurance.invalid"))
      )
    ),
    healthInsurance: optional(
      pipe(
        number(),
        minValue(0, t("validation.healthInsurance.invalid"))
      )
    ),
    unemploymentInsurance: optional(
      pipe(
        number(),
        minValue(0, t("validation.unemploymentInsurance.invalid"))
      )
    ),
    personalIncomeTax: optional(
      pipe(
        number(),
        minValue(0, t("validation.personalIncomeTax.invalid"))
      )
    ),
    workingDays: optional(
      pipe(
        number(),
        minValue(0, t("validation.workingDays.invalid"))
      )
    ),
    workingHours: optional(
      pipe(
        number(),
        minValue(0, t("validation.workingHours.invalid"))
      )
    ),
    overtimeHours: optional(
      pipe(
        number(),
        minValue(0, t("validation.overtimeHours.invalid"))
      )
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

