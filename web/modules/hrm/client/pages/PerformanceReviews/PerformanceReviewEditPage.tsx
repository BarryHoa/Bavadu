"use client";

import { IBaseButton, IBasePageLayout, IBaseSpinner } from "@base/client";
import { useCreateUpdate, useLocalizedText, useSetBreadcrumbs } from "@base/client/hooks";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import { performanceReviewService } from "@mdl/hrm/client/services/PerformanceReviewService";

import PerformanceReviewForm, {
  type PerformanceReviewFormValues,
} from "./components/PerformanceReviewForm/PerformanceReviewForm";

const PERFORMANCE_REVIEWS_LIST_PATH = "/workspace/modules/hrm/performance-reviews";

export default function PerformanceReviewEditPage(): React.ReactNode {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations("hrm.performanceReviews");
  const tCommon = useTranslations("common");
  const getLocalizedText = useLocalizedText();

  const {
    data: performanceReviewData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["hrm-performance-reviews", id],
    queryFn: async () => {
      const response = await performanceReviewService.getById(id);

      if (!response.data) {
        throw new Error(
          response.message ?? t("errors.failedToLoadPerformanceReview"),
        );
      }

      return response.data;
    },
    enabled: !!id,
  });

  const {
    handleSubmit: submitPerformanceReview,
    error: submitError,
    isPending,
  } = useCreateUpdate<
    Parameters<typeof performanceReviewService.update>[0],
    { data: { id: string } }
  >({
    mutationFn: async (payload) => {
      const response = await performanceReviewService.update(payload);

      if (!response.data) {
        throw new Error(
          response.message ?? t("errors.failedToUpdatePerformanceReview"),
        );
      }

      return { data: { id: response.data.id } };
    },
    invalidateQueries: [
      ["hrm-performance-reviews"],
      ["hrm-performance-reviews", id],
    ],
    onSuccess: (data) => {
      router.push(`${PERFORMANCE_REVIEWS_LIST_PATH}/view/${data.data.id}`);
    },
  });

  const viewPath = `${PERFORMANCE_REVIEWS_LIST_PATH}/view/${id}`;
  const breadcrumbs = useMemo(
    () =>
      performanceReviewData
        ? [
            { label: t("title"), href: PERFORMANCE_REVIEWS_LIST_PATH },
            {
              label:
                getLocalizedText(performanceReviewData.employee?.fullName) ||
                performanceReviewData.employee?.employeeCode ||
                performanceReviewData.reviewType ||
                t("edit"),
              href: viewPath,
            },
            { label: t("edit") },
          ]
        : [
            { label: t("title"), href: PERFORMANCE_REVIEWS_LIST_PATH },
            { label: t("edit") },
          ],
    [t, performanceReviewData, viewPath, getLocalizedText],
  );
  useSetBreadcrumbs(breadcrumbs);

  const handleSubmit = async (values: PerformanceReviewFormValues) => {
    await submitPerformanceReview({
      id,
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-default-500">
        <IBaseSpinner size="md" />
        <span>{tCommon("loading")}</span>
      </div>
    );
  }

  if (isError || !performanceReviewData) {
    return (
      <div className="flex flex-col gap-4 rounded-xl border-2 border-danger-200 bg-danger-50/50 p-6">
        <p className="font-medium text-danger-700">
          {error instanceof Error ? error.message : tCommon("errors.dataNotFound")}
        </p>
        <IBaseButton
          size="sm"
          variant="bordered"
          color="danger"
          onPress={() => refetch()}
        >
          Retry
        </IBaseButton>
      </div>
    );
  }

  const subtitle = [
    performanceReviewData.reviewType,
    performanceReviewData.reviewDate,
  ].filter(Boolean).join(" · ");

  return (
    <IBasePageLayout
      variant="edit"
      maxWidth="form"
      title={t("edit")}
      subtitle={subtitle || undefined}
    >
      <PerformanceReviewForm
      defaultValues={{
        employeeId: performanceReviewData.employeeId,
        reviewType: performanceReviewData.reviewType,
        reviewPeriod: performanceReviewData.reviewPeriod || "",
        reviewDate: performanceReviewData.reviewDate,
        reviewerId: performanceReviewData.reviewerId,
        overallRating: performanceReviewData.overallRating || undefined,
        strengths: performanceReviewData.strengths || "",
        areasForImprovement: performanceReviewData.areasForImprovement || "",
        feedback: performanceReviewData.feedback || "",
        employeeComments: performanceReviewData.employeeComments || "",
        status: performanceReviewData.status,
      }}
      isSubmitting={isPending}
      submitError={submitError}
      onCancel={() => router.push(viewPath)}
        onSubmit={handleSubmit}
      />
    </IBasePageLayout>
  );
}
