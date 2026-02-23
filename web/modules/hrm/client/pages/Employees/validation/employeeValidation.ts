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

/**
 * Translation function type
 */
type TranslateFn = (key: string, values?: Record<string, any>) => string;

/**
 * Create validation schemas with translation support
 */
export function createEmployeeValidation(t: TranslateFn) {
  // Employee code validation
  const employeeCodeSchema = pipe(
    string(),
    trim(),
    minLength(1, t("employeeCode.required")),
  );

  // Full name (optional; display-only, comes from user)
  const fullNameSchema = optional(
    custom<{ vi?: string; en?: string }>((value) => {
      if (value === undefined || value === null) return true;
      if (typeof value !== "object") return false;
      const obj = value as any;
      return (
        (obj.vi !== undefined && typeof obj.vi === "string") ||
        (obj.en !== undefined && typeof obj.en === "string")
      );
    }, t("fullName.required")),
  );

  // Email validation (optional; display-only)
  const emailSchema = optional(
    pipe(
      string(),
      trim(),
      custom(
        (value) =>
          value === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value)),
        t("email.invalid"),
      ),
    ),
  );

  const phoneSchema = optional(pipe(string(), trim()));
  const dateSchema = pipe(string(), trim());

  // Main form schema — HR fields + optional userId (create) and display-only personal fields
  const employeeFormSchema = object({
    userId: optional(pipe(string(), trim())),
    employeeCode: employeeCodeSchema,
    firstName: optional(pipe(string(), trim())),
    lastName: optional(pipe(string(), trim())),
    fullName: fullNameSchema,
    email: emailSchema,
    phone: phoneSchema,
    dateOfBirth: optional(dateSchema),
    gender: optional(pipe(string(), trim())),
    nationalId: optional(pipe(string(), trim())),
    taxId: optional(pipe(string(), trim())),
    address: optional(object({})),
    positionId: pipe(string(), trim(), minLength(1, t("positionId.required"))),
    departmentId: pipe(
      string(),
      trim(),
      minLength(1, t("departmentId.required")),
    ),
    managerId: optional(pipe(string(), trim())),
    employmentStatus: optional(pipe(string(), trim())),
    employmentType: optional(pipe(string(), trim())),
    hireDate: pipe(string(), trim(), minLength(1, t("hireDate.required"))),
    probationEndDate: optional(dateSchema),
    baseSalary: optional(
      pipe(
        string(),
        trim(),
        custom((value) => {
          if (value === "") return true;
          const num = Number(value);
          return !Number.isNaN(num) && num >= 0;
        }, t("baseSalary.invalid")),
      ),
    ),
    currency: optional(pipe(string(), trim())),
    locationId: optional(pipe(string(), trim())),
    bankAccount: optional(pipe(string(), trim())),
    bankName: optional(pipe(string(), trim())),
    bankBranch: optional(pipe(string(), trim())),
    emergencyContactName: optional(pipe(string(), trim())),
    emergencyContactPhone: optional(pipe(string(), trim())),
    isActive: optional(boolean()),
  });

  // Form values type
  type EmployeeFormValues = InferOutput<typeof employeeFormSchema>;

  return {
    employeeFormSchema,
  };
}

export type EmployeeFormValues = InferOutput<
  ReturnType<typeof createEmployeeValidation>["employeeFormSchema"]
>;
