"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

import { IBasePageLayout } from "@base/client";
import { useCreateUpdate, useSetBreadcrumbs } from "@base/client/hooks";
import { performanceReviewService } from "@mdl/hrm/client/services/PerformanceReviewService";

import PerformanceReviewForm, {
  type PerformanceReviewFormValues,
} from "../components/PerformanceReviewForm/PerformanceReviewForm";

const PERFORMANCE_REVIEWS_LIST_PATH = "/workspace/modules/hrm/performance-reviews";

export default function PerformanceReviewCreatePageClient(): React.ReactNode {
  const router = useRouter();
  const t = useTranslations("hrm.performanceReviews");

  const breadcrumbs = useMemo(
    () => [
      { label: t("title"), href: PERFORMANCE_REVIEWS_LIST_PATH },
      { label: t("create") },
    ],
    [t],
  );

  useSetBreadcrumbs(breadcrumbs);

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
        throw new Error(
          response.message ?? t("errors.failedToCreatePerformanceReview"),
        );
      }

      return { data: { id: response.data.id } };
    },
    invalidateQueries: [["hrm-performance-reviews"]],
    onSuccess: (data) => {
      router.push(`${PERFORMANCE_REVIEWS_LIST_PATH}/view/${data.data.id}`);
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
    <IBasePageLayout
      maxWidth="form"
      title={t("create")}
      variant="create"
    >
      <PerformanceReviewForm
        isSubmitting={isPending}
        submitError={submitError}
        onCancel={() => router.push(PERFORMANCE_REVIEWS_LIST_PATH)}
        onSubmit={handleSubmit}
      />
    </IBasePageLayout>
  );
}
