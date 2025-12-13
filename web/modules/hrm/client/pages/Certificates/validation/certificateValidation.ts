import {
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

export function createCertificateValidation(t: TranslateFn) {
  const fullNameSchema = custom<{ vi?: string; en?: string }>(
    (value) => {
      if (!value || typeof value !== "object") return false;
      const obj = value as any;
      return (
        (obj.vi !== undefined && typeof obj.vi === "string" && obj.vi.trim() !== "") ||
        (obj.en !== undefined && typeof obj.en === "string" && obj.en.trim() !== "")
      );
    },
    t("validation.name.required")
  );

  const certificateFormSchema = object({
    employeeId: pipe(
      string(),
      trim(),
      minLength(1, t("validation.employeeId.required"))
    ),
    name: fullNameSchema,
    issuer: pipe(
      string(),
      trim(),
      minLength(1, t("validation.issuer.required"))
    ),
    certificateNumber: optional(pipe(string(), trim())),
    issueDate: pipe(
      string(),
      trim(),
      minLength(1, t("validation.issueDate.required"))
    ),
    expiryDate: optional(pipe(string(), trim())),
    documentUrl: optional(pipe(string(), trim())),
    isActive: optional(pipe(string(), trim())),
  });

  return {
    certificateFormSchema,
  };
}

export type CertificateFormValues = InferOutput<
  ReturnType<typeof createCertificateValidation>["certificateFormSchema"]
>;

