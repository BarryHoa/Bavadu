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

export function createLeaveRequestValidation(t: TranslateFn) {
  const leaveRequestFormSchema = object({
    employeeId: pipe(
      string(),
      trim(),
      minLength(1, t("validation.employeeId.required"))
    ),
    leaveTypeId: pipe(
      string(),
      trim(),
      minLength(1, t("validation.leaveTypeId.required"))
    ),
    startDate: pipe(
      string(),
      trim(),
      minLength(1, t("validation.startDate.required"))
    ),
    endDate: pipe(
      string(),
      trim(),
      minLength(1, t("validation.endDate.required"))
    ),
    days: pipe(
      number(),
      minValue(1, t("validation.days.invalid"))
    ),
    reason: optional(pipe(string(), trim())),
    status: optional(pipe(string(), trim())),
  });

  return {
    leaveRequestFormSchema,
  };
}

export type LeaveRequestFormValues = InferOutput<
  ReturnType<typeof createLeaveRequestValidation>["leaveRequestFormSchema"]
>;

