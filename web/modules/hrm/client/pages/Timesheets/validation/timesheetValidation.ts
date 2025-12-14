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

export function createTimesheetValidation(t: TranslateFn) {
  const timesheetFormSchema = object({
    employeeId: pipe(
      string(),
      trim(),
      minLength(1, t("validation.employeeId.required"))
    ),
    rosterId: optional(pipe(string(), trim())),
    workDate: pipe(
      string(),
      trim(),
      minLength(1, t("validation.workDate.required"))
    ),
    shiftId: optional(pipe(string(), trim())),
    checkInTime: optional(pipe(string(), trim())),
    checkOutTime: optional(pipe(string(), trim())),
    breakDuration: optional(
      pipe(
        number(),
        minValue(0, t("validation.breakDuration.invalid"))
      )
    ),
    status: optional(pipe(string(), trim())),
    checkInMethod: optional(pipe(string(), trim())),
    checkOutMethod: optional(pipe(string(), trim())),
    checkInLocation: optional(pipe(string(), trim())),
    checkOutLocation: optional(pipe(string(), trim())),
    notes: optional(pipe(string(), trim())),
  });

  return {
    timesheetFormSchema,
  };
}

export type TimesheetFormValues = InferOutput<
  ReturnType<typeof createTimesheetValidation>["timesheetFormSchema"]
>;

