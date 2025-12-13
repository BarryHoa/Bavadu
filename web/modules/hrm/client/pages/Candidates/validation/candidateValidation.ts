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

export function createCandidateValidation(t: TranslateFn) {
  const fullNameSchema = custom<{ vi?: string; en?: string }>(
    (value) => {
      if (!value || typeof value !== "object") return false;
      const obj = value as any;
      return (
        (obj.vi !== undefined && typeof obj.vi === "string" && obj.vi.trim() !== "") ||
        (obj.en !== undefined && typeof obj.en === "string" && obj.en.trim() !== "")
      );
    },
    t("validation.fullName.required")
  );

  const emailSchema = pipe(
    string(),
    trim(),
    custom(
      (value) => value === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      t("validation.email.invalid")
    )
  );

  const candidateFormSchema = object({
    requisitionId: pipe(
      string(),
      trim(),
      minLength(1, t("validation.requisitionId.required"))
    ),
    firstName: optional(pipe(string(), trim())),
    lastName: optional(pipe(string(), trim())),
    fullName: fullNameSchema,
    email: optional(emailSchema),
    phone: optional(pipe(string(), trim())),
    dateOfBirth: optional(pipe(string(), trim())),
    gender: optional(pipe(string(), trim())),
    address: optional(object({})),
    cvUrl: optional(pipe(string(), trim())),
    coverLetter: optional(pipe(string(), trim())),
    source: optional(pipe(string(), trim())),
    status: optional(pipe(string(), trim())),
    stage: optional(pipe(string(), trim())),
    rating: optional(
      pipe(
        number(),
        custom((value) => value >= 0 && value <= 5, t("validation.rating.invalid"))
      )
    ),
    notes: optional(pipe(string(), trim())),
  });

  return {
    candidateFormSchema,
  };
}

export type CandidateFormValues = InferOutput<
  ReturnType<typeof createCandidateValidation>["candidateFormSchema"]
>;

