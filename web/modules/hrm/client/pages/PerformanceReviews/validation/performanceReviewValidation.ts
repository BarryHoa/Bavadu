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

export function createPerformanceReviewValidation(t: TranslateFn) {
  const performanceReviewFormSchema = object({
    employeeId: pipe(
      string(),
      trim(),
      minLength(1, t("validation.employeeId.required"))
    ),
    reviewType: pipe(
      string(),
      trim(),
      minLength(1, t("validation.reviewType.required"))
    ),
    reviewPeriod: optional(pipe(string(), trim())),
    reviewDate: pipe(
      string(),
      trim(),
      minLength(1, t("validation.reviewDate.required"))
    ),
    reviewerId: pipe(
      string(),
      trim(),
      minLength(1, t("validation.reviewerId.required"))
    ),
    overallRating: optional(
      pipe(
        number(),
        (value) => {
          if (value >= 1 && value <= 5) return true;
          throw new Error(t("validation.overallRating.invalid"));
        }
      )
    ),
    strengths: optional(pipe(string(), trim())),
    areasForImprovement: optional(pipe(string(), trim())),
    feedback: optional(pipe(string(), trim())),
    employeeComments: optional(pipe(string(), trim())),
    status: optional(pipe(string(), trim())),
  });

  return {
    performanceReviewFormSchema,
  };
}

export type PerformanceReviewFormValues = InferOutput<
  ReturnType<typeof createPerformanceReviewValidation>["performanceReviewFormSchema"]
>;

