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
  }, t("name.required"));

  const leaveTypeFormSchema = object({
    code: pipe(string(), trim(), minLength(1, t("code.required"))),
    name: fullNameSchema,
    description: optional(object({})),
    accrualType: pipe(
      string(),
      trim(),
      minLength(1, t("accrualType.required")),
    ),
    accrualRate: optional(
      pipe(number(), minValue(0, t("accrualRate.invalid"))),
    ),
    maxAccrual: optional(pipe(number(), minValue(0, t("maxAccrual.invalid")))),
    carryForward: optional(pipe(string(), trim())),
    maxCarryForward: optional(
      pipe(number(), minValue(0, t("maxCarryForward.invalid"))),
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
