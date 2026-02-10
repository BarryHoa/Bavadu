import {
  boolean,
  custom,
  minLength,
  object,
  optional,
  pipe,
  string,
  trim,
  type InferOutput,
} from "valibot";

type TranslateFn = (key: string, values?: Record<string, any>) => string;

export function createContractValidation(t: TranslateFn) {
  const contractNumberSchema = pipe(
    string(),
    trim(),
    minLength(1, t("contractNumber.required")),
  );

  const contractFormSchema = object({
    contractNumber: contractNumberSchema,
    employeeId: pipe(string(), trim(), minLength(1, t("employeeId.required"))),
    contractType: pipe(
      string(),
      trim(),
      minLength(1, t("contractType.required")),
    ),
    startDate: pipe(string(), trim(), minLength(1, t("startDate.required"))),
    endDate: optional(pipe(string(), trim())),
    baseSalary: pipe(
      string(),
      trim(),
      minLength(1, t("baseSalary.required")),
      custom((value) => {
        const num = Number(value);

        return !Number.isNaN(num) && num >= 0;
      }, t("baseSalary.invalid")),
    ),
    currency: optional(pipe(string(), trim())),
    workingHours: optional(
      pipe(
        string(),
        trim(),
        custom((value) => {
          if (value === "") return true;
          const num = Number(value);

          return !Number.isNaN(num) && num >= 0;
        }, t("workingHours.invalid")),
      ),
    ),
    probationPeriod: optional(
      pipe(
        string(),
        trim(),
        custom((value) => {
          if (value === "") return true;
          const num = Number(value);

          return !Number.isNaN(num) && num >= 0;
        }, t("probationPeriod.invalid")),
      ),
    ),
    probationEndDate: optional(pipe(string(), trim())),
    status: optional(pipe(string(), trim())),
    documentUrl: optional(pipe(string(), trim())),
    signedDate: optional(pipe(string(), trim())),
    signedBy: optional(pipe(string(), trim())),
    notes: optional(pipe(string(), trim())),
    isActive: optional(boolean()),
  });

  return {
    contractFormSchema,
  };
}

export type ContractFormValues = InferOutput<
  ReturnType<typeof createContractValidation>["contractFormSchema"]
>;
