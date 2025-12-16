import {
  custom,
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

export function createJobRequisitionValidation(t: TranslateFn) {
  const fullNameSchema = custom((value) => {
    const obj = value as { vi?: string; en?: string };

    if (!obj || typeof obj !== "object") return false;

    return (
      (obj.vi !== undefined &&
        typeof obj.vi === "string" &&
        obj.vi.trim() !== "") ||
      (obj.en !== undefined &&
        typeof obj.en === "string" &&
        obj.en.trim() !== "")
    );
  }, t("validation.title.required"));

  const descriptionSchema = custom((value) => {
    const obj = value as { vi?: string; en?: string } | null;

    if (obj === null || obj === undefined) return true;
    if (typeof obj !== "object") return false;

    return (
      (obj.vi !== undefined && typeof obj.vi === "string") ||
      (obj.en !== undefined && typeof obj.en === "string")
    );
  }, t("validation.description.invalid"));

  const jobRequisitionFormSchema = object({
    requisitionNumber: pipe(
      string(),
      trim(),
      minLength(1, t("validation.requisitionNumber.required")),
    ),
    title: fullNameSchema,
    description: optional(descriptionSchema),
    departmentId: pipe(
      string(),
      trim(),
      minLength(1, t("validation.departmentId.required")),
    ),
    positionId: pipe(
      string(),
      trim(),
      minLength(1, t("validation.positionId.required")),
    ),
    numberOfOpenings: optional(
      pipe(number(), minValue(1, t("validation.numberOfOpenings.invalid"))),
    ),
    priority: optional(pipe(string(), trim())),
    employmentType: optional(pipe(string(), trim())),
    minSalary: optional(
      pipe(number(), minValue(0, t("validation.minSalary.invalid"))),
    ),
    maxSalary: optional(
      pipe(number(), minValue(0, t("validation.maxSalary.invalid"))),
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
