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

type TranslateFn = (key: string, values?: Record<string, any>) => string;

export function createPositionValidation(t: TranslateFn) {
  const codeSchema = pipe(
    string(),
    trim(),
    minLength(1, t("validation.code.required")),
  );

  const nameSchema = custom<{ vi?: string; en?: string }>((value) => {
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
  }, t("validation.name.required"));

  const positionFormSchema = object({
    code: codeSchema,
    name: nameSchema,
    description: optional(
      custom<{ vi?: string; en?: string }>((value) => {
        if (!value) return true;
        if (typeof value !== "object") return false;

        return true;
      }, t("validation.description.invalid")),
    ),
    departmentId: pipe(
      string(),
      trim(),
      minLength(1, t("validation.departmentId.required")),
    ),
    jobFamily: optional(pipe(string(), trim())),
    jobGrade: optional(pipe(string(), trim())),
    reportsTo: optional(pipe(string(), trim())),
    minSalary: optional(
      pipe(
        string(),
        trim(),
        custom((value) => {
          if (value === "") return true;
          const num = Number(value);

          return !Number.isNaN(num) && num >= 0;
        }, t("validation.minSalary.invalid")),
      ),
    ),
    maxSalary: optional(
      pipe(
        string(),
        trim(),
        custom((value) => {
          if (value === "") return true;
          const num = Number(value);

          return !Number.isNaN(num) && num >= 0;
        }, t("validation.maxSalary.invalid")),
      ),
    ),
    isActive: optional(boolean()),
  });

  return {
    positionFormSchema,
  };
}

export type PositionFormValues = InferOutput<
  ReturnType<typeof createPositionValidation>["positionFormSchema"]
>;
