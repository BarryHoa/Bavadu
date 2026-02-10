import {
  custom,
  maxValue,
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

export function createCandidateValidation(t: TranslateFn) {
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
  }, t("fullName.required"));

  const emailSchema = pipe(
    string(),
    trim(),
    custom((value) => {
      const str = value as string;

      return str === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
    }, t("email.invalid")),
  );

  const candidateFormSchema = object({
    requisitionId: pipe(
      string(),
      trim(),
      minLength(1, t("requisitionId.required")),
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
        minValue(0, t("rating.min")),
        maxValue(5, t("rating.max")),
      ),
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
