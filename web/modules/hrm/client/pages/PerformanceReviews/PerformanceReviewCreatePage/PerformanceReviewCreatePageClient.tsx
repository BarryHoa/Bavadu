"use client";

import { useCreateUpdate } from "@base/client/hooks/useCreateUpdate";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { performanceReviewService } from "@mdl/hrm/client/services/PerformanceReviewService";
import PerformanceReviewForm, {
  type PerformanceReviewFormValues,
} from "../components/PerformanceReviewForm/PerformanceReviewForm";

export default function PerformanceReviewCreatePageClient(): React.ReactNode {
  const router = useRouter();
  const t = useTranslations("hrm.performanceReviews");

  const {
    handleSubmit: submitPerformanceReview,
    error: submitError,
    isPending,
  } = useCreateUpdate<
    Parameters<typeof performanceReviewService.create>[0],
    { data: { id: string } }
  >({
    mutationFn: async (payload) => {
      const response = await performanceReviewService.create(payload);
      if (!response.data) {
        throw new Error(response.message ?? t("errors.failedToCreatePerformanceReview"));
      }
      return { data: { id: response.data.id } };
    },
    invalidateQueries: [["hrm-performance-reviews"]],
    onSuccess: (data) => {
      router.push(`/workspace/modules/hrm/performance-reviews/view/${data.data.id}`);
    },
  });

  const handleSubmit = async (values: PerformanceReviewFormValues) => {
    await submitPerformanceReview({
      employeeId: values.employeeId.trim(),
      reviewType: values.reviewType.trim(),
      reviewPeriod: values.reviewPeriod?.trim() || null,
      reviewDate: values.reviewDate.trim(),
      reviewerId: values.reviewerId.trim(),
      overallRating: values.overallRating || null,
      strengths: values.strengths?.trim() || null,
      areasForImprovement: values.areasForImprovement?.trim() || null,
      goals: values.goals || null,
      feedback: values.feedback?.trim() || null,
      employeeComments: values.employeeComments?.trim() || null,
      status: values.status || "draft",
    });
  };

  return (
    <PerformanceReviewForm
      onSubmit={handleSubmit}
      onCancel={() => router.push("/workspace/modules/hrm/performance-reviews")}
      submitError={submitError}
      isSubmitting={isPending}
    />
  );
}

