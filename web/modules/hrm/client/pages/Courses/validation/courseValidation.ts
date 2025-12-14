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

export function createCourseValidation(t: TranslateFn) {
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

  const courseFormSchema = object({
    code: pipe(
      string(),
      trim(),
      minLength(1, t("validation.code.required"))
    ),
    name: fullNameSchema,
    description: optional(object({})),
    category: optional(pipe(string(), trim())),
    duration: optional(
      pipe(
        number(),
        minValue(0, t("validation.duration.invalid"))
      )
    ),
    format: optional(pipe(string(), trim())),
    instructor: optional(pipe(string(), trim())),
    isActive: optional(pipe(string(), trim())),
  });

  return {
    courseFormSchema,
  };
}

export type CourseFormValues = InferOutput<
  ReturnType<typeof createCourseValidation>["courseFormSchema"]
>;

