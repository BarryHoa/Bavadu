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

export function createDepartmentValidation(t: TranslateFn) {
  const codeSchema = pipe(
    string(),
    trim(),
    minLength(1, t("validation.code.required"))
  );

  const nameSchema = custom<{ vi?: string; en?: string }>(
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

  const departmentFormSchema = object({
    code: codeSchema,
    name: nameSchema,
    description: optional(custom<{ vi?: string; en?: string }>(
      (value) => {
        if (!value) return true;
        if (typeof value !== "object") return false;
        return true;
      },
      t("validation.description.invalid")
    )),
    parentId: optional(pipe(string(), trim())),
    level: optional(pipe(string(), trim(), custom((value) => {
      if (value === "") return true;
      const num = Number(value);
      return !Number.isNaN(num) && num >= 0;
    }, t("validation.level.invalid")))),
    managerId: optional(pipe(string(), trim())),
    locationId: optional(pipe(string(), trim())),
    isActive: optional(boolean()),
  });

  return {
    departmentFormSchema,
  };
}

export type DepartmentFormValues = InferOutput<
  ReturnType<typeof createDepartmentValidation>["departmentFormSchema"]
>;

