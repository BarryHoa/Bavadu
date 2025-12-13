import {
  custom,
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

export function createJobRequisitionValidation(t: TranslateFn) {
  const fullNameSchema = custom<{ vi?: string; en?: string }>(
    (value) => {
      if (!value || typeof value !== "object") return false;
      const obj = value as any;
      return (
        (obj.vi !== undefined && typeof obj.vi === "string" && obj.vi.trim() !== "") ||
        (obj.en !== undefined && typeof obj.en === "string" && obj.en.trim() !== "")
      );
    },
    t("validation.title.required")
  );

  const jobRequisitionFormSchema = object({
    requisitionNumber: pipe(
      string(),
      trim(),
      minLength(1, t("validation.requisitionNumber.required"))
    ),
    title: fullNameSchema,
    description: optional(object({})),
    departmentId: pipe(
      string(),
      trim(),
      minLength(1, t("validation.departmentId.required"))
    ),
    positionId: pipe(
      string(),
      trim(),
      minLength(1, t("validation.positionId.required"))
    ),
    numberOfOpenings: optional(
      pipe(
        number(),
        custom((value) => value > 0, t("validation.numberOfOpenings.invalid"))
      )
    ),
    priority: optional(pipe(string(), trim())),
    employmentType: optional(pipe(string(), trim())),
    minSalary: optional(
      pipe(
        number(),
        custom((value) => value >= 0, t("validation.minSalary.invalid"))
      )
    ),
    maxSalary: optional(
      pipe(
        number(),
        custom((value) => value >= 0, t("validation.maxSalary.invalid"))
      )
    ),
    currency: optional(pipe(string(), trim())),
    requirements: optional(pipe(string(), trim())),
    status: optional(pipe(string(), trim())),
    openedDate: optional(pipe(string(), trim())),
    closedDate: optional(pipe(string(), trim())),
    hiringManagerId: optional(pipe(string(), trim())),
    recruiterId: optional(pipe(string(), trim())),
    notes: optional(pipe(string(), trim())),
  });

  return {
    jobRequisitionFormSchema,
  };
}

export type JobRequisitionFormValues = InferOutput<
  ReturnType<typeof createJobRequisitionValidation>["jobRequisitionFormSchema"]
>;

