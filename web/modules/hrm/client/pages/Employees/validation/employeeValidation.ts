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
  const passwordSchema = optional(
    pipe(
      string(),
      trim(),
      minLength(6, t("password.minLength")),
    ),
  );
  const roleIdsSchema = optional(
    custom<string[]>((value) => {
      if (value === undefined || value === null) return true;
      return Array.isArray(value);
    }, t("roleIds.invalid")),
  );
  const permissionIdsSchema = optional(
    custom<string[]>((value) => {
      if (value === undefined || value === null) return true;
      return Array.isArray(value);
    }, t("roleIds.invalid")),
  );
  const emailsSchema = pipe(
    custom<string[]>((value) => {
      if (value === undefined || value === null) return false;
      if (!Array.isArray(value)) return false;
      const filled = value
        .map((s) => (typeof s === "string" ? s.trim() : ""))
        .filter((s) => s.length > 0);
      if (filled.length === 0) return false;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return filled.every((s) => emailRegex.test(s));
    }, t("emails.requiredAtLeastOneValid")),
  );
  const phonesSchema = pipe(
    custom<string[]>((value) => {
      if (value === undefined || value === null) return false;
      if (!Array.isArray(value)) return false;
      const filled = value
        .map((s) => (typeof s === "string" ? s.trim() : ""))
        .filter((s) => s.length > 0);
      return filled.length >= 1;
    }, t("phones.requiredAtLeastOne")),
  );
  const genderSchema = optional(
    pipe(
      string(),
      trim(),
      custom(
        (v) => !v || ["male", "female", "unspecified"].includes(v),
        "Invalid gender",
      ),
    ),
  );

  // Main form schema — 2 tabs: Thông tin (sections) + Phân quyền (roles + matrix)
  const employeeFormSchema = object({
    loginIdentifier: optional(pipe(string(), trim())),
    password: passwordSchema,
    emails: emailsSchema,
    phones: phonesSchema,
    firstName: optional(pipe(string(), trim())),
    lastName: optional(pipe(string(), trim())),
    commonName: optional(pipe(string(), trim())),
    bio: optional(pipe(string(), trim())),
    dateOfBirth: optional(dateSchema),
    gender: genderSchema,
    address: optional(object({})),
    notes: optional(pipe(string(), trim())),
    educationLevel: optional(pipe(string(), trim())),
    experience: optional(pipe(string(), trim())),
    employeeCode: employeeCodeSchema,
    nationalId: pipe(string(), trim(), minLength(1, t("nationalId.required"))),
    taxId: optional(pipe(string(), trim())),
    positionId: pipe(string(), trim(), minLength(1, t("positionId.required"))),
    departmentId: pipe(
      string(),
      trim(),
      minLength(1, t("departmentId.required")),
    ),
    employmentStatus: optional(pipe(string(), trim())),
    hireDate: optional(dateSchema),
    probationEndDate: optional(dateSchema),
    bankAccount: optional(pipe(string(), trim())),
    bankName: optional(pipe(string(), trim())),
    bankBranch: optional(pipe(string(), trim())),
    emergencyContactName: optional(pipe(string(), trim())),
    emergencyContactPhone: optional(pipe(string(), trim())),
    isActive: optional(boolean()),
    roleIds: roleIdsSchema,
    permissionIds: permissionIdsSchema,
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
