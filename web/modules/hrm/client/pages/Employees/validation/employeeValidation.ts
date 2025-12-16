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
    minLength(1, t("validation.employeeCode.required")),
  );

  // Full name validation (object with vi/en) - using custom validation
  const fullNameSchema = custom<{ vi?: string; en?: string }>((value) => {
    if (!value || typeof value !== "object") return false;
    const obj = value as any;

    return (
      (obj.vi !== undefined &&
        typeof obj.vi === "string" &&
        obj.vi.trim() !== "") ||
      (obj.en !== undefined &&
        typeof obj.en === "string" &&
        obj.en.trim() !== "")
    );
  }, t("validation.fullName.required"));

  // Email validation
  const emailSchema = pipe(
    string(),
    trim(),
    custom(
      (value) =>
        value === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value)),
      t("validation.email.invalid"),
    ),
  );

  // Phone validation
  const phoneSchema = pipe(string(), trim());

  // Date validation
  const dateSchema = pipe(string(), trim());

  // Main form schema
  const employeeFormSchema = object({
    employeeCode: employeeCodeSchema,
    firstName: optional(pipe(string(), trim())),
    lastName: optional(pipe(string(), trim())),
    fullName: fullNameSchema,
    email: optional(emailSchema),
    phone: optional(phoneSchema),
    dateOfBirth: optional(dateSchema),
    gender: optional(pipe(string(), trim())),
    nationalId: optional(pipe(string(), trim())),
    taxId: optional(pipe(string(), trim())),
    address: optional(object({})),
    positionId: pipe(
      string(),
      trim(),
      minLength(1, t("validation.positionId.required")),
    ),
    departmentId: pipe(
      string(),
      trim(),
      minLength(1, t("validation.departmentId.required")),
    ),
    managerId: optional(pipe(string(), trim())),
    employmentStatus: optional(pipe(string(), trim())),
    employmentType: optional(pipe(string(), trim())),
    hireDate: pipe(
      string(),
      trim(),
      minLength(1, t("validation.hireDate.required")),
    ),
    probationEndDate: optional(dateSchema),
    baseSalary: optional(
      pipe(
        string(),
        trim(),
        custom((value) => {
          if (value === "") return true;
          const num = Number(value);

          return !Number.isNaN(num) && num >= 0;
        }, t("validation.baseSalary.invalid")),
      ),
    ),
    currency: optional(pipe(string(), trim())),
    locationId: optional(pipe(string(), trim())),
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
