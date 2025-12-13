import {
  minLength,
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
      (value) => {
        if (value >= 0) return true;
        throw new Error(t("validation.baseSalary.invalid"));
      }
    ),
    overtimePay: optional(
      pipe(
        number(),
        (value) => {
          if (value >= 0) return true;
          throw new Error(t("validation.overtimePay.invalid"));
        }
      )
    ),
    bonuses: optional(
      pipe(
        number(),
        (value) => {
          if (value >= 0) return true;
          throw new Error(t("validation.bonuses.invalid"));
        }
      )
    ),
    otherEarnings: optional(
      pipe(
        number(),
        (value) => {
          if (value >= 0) return true;
          throw new Error(t("validation.otherEarnings.invalid"));
        }
      )
    ),
    socialInsurance: optional(
      pipe(
        number(),
        (value) => {
          if (value >= 0) return true;
          throw new Error(t("validation.socialInsurance.invalid"));
        }
      )
    ),
    healthInsurance: optional(
      pipe(
        number(),
        (value) => {
          if (value >= 0) return true;
          throw new Error(t("validation.healthInsurance.invalid"));
        }
      )
    ),
    unemploymentInsurance: optional(
      pipe(
        number(),
        (value) => {
          if (value >= 0) return true;
          throw new Error(t("validation.unemploymentInsurance.invalid"));
        }
      )
    ),
    personalIncomeTax: optional(
      pipe(
        number(),
        (value) => {
          if (value >= 0) return true;
          throw new Error(t("validation.personalIncomeTax.invalid"));
        }
      )
    ),
    workingDays: optional(
      pipe(
        number(),
        (value) => {
          if (value >= 0) return true;
          throw new Error(t("validation.workingDays.invalid"));
        }
      )
    ),
    workingHours: optional(
      pipe(
        number(),
        (value) => {
          if (value >= 0) return true;
          throw new Error(t("validation.workingHours.invalid"));
        }
      )
    ),
    overtimeHours: optional(
      pipe(
        number(),
        (value) => {
          if (value >= 0) return true;
          throw new Error(t("validation.overtimeHours.invalid"));
        }
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

