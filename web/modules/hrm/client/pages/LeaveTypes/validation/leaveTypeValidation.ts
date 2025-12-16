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

export function createLeaveTypeValidation(t: TranslateFn) {
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
  }, t("validation.name.required"));

  const leaveTypeFormSchema = object({
    code: pipe(string(), trim(), minLength(1, t("validation.code.required"))),
    name: fullNameSchema,
    description: optional(object({})),
    accrualType: pipe(
      string(),
      trim(),
      minLength(1, t("validation.accrualType.required")),
    ),
    accrualRate: optional(
      pipe(number(), minValue(0, t("validation.accrualRate.invalid"))),
    ),
    maxAccrual: optional(
      pipe(number(), minValue(0, t("validation.maxAccrual.invalid"))),
    ),
    carryForward: optional(pipe(string(), trim())),
    maxCarryForward: optional(
      pipe(number(), minValue(0, t("validation.maxCarryForward.invalid"))),
    ),
    requiresApproval: optional(pipe(string(), trim())),
    isPaid: optional(pipe(string(), trim())),
    isActive: optional(pipe(string(), trim())),
  });

  return {
    leaveTypeFormSchema,
  };
}

export type LeaveTypeFormValues = InferOutput<
  ReturnType<typeof createLeaveTypeValidation>["leaveTypeFormSchema"]
>;
