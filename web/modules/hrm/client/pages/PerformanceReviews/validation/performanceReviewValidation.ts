import {
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

export function createPerformanceReviewValidation(t: TranslateFn) {
  const performanceReviewFormSchema = object({
    employeeId: pipe(
      string(),
      trim(),
      minLength(1, t("validation.employeeId.required")),
    ),
    reviewType: pipe(
      string(),
      trim(),
      minLength(1, t("validation.reviewType.required")),
    ),
    reviewPeriod: optional(pipe(string(), trim())),
    reviewDate: pipe(
      string(),
      trim(),
      minLength(1, t("validation.reviewDate.required")),
    ),
    reviewerId: pipe(
      string(),
      trim(),
      minLength(1, t("validation.reviewerId.required")),
    ),
    overallRating: optional(
      pipe(
        number(),
        minValue(1, t("validation.overallRating.min")),
        maxValue(5, t("validation.overallRating.max")),
      ),
    ),
    strengths: optional(pipe(string(), trim())),
    areasForImprovement: optional(pipe(string(), trim())),
    goals: optional(string()),
    feedback: optional(pipe(string(), trim())),
    employeeComments: optional(pipe(string(), trim())),
    status: optional(pipe(string(), trim())),
  });

  return {
    performanceReviewFormSchema,
  };
}

export type PerformanceReviewFormValues = InferOutput<
  ReturnType<
    typeof createPerformanceReviewValidation
  >["performanceReviewFormSchema"]
>;
