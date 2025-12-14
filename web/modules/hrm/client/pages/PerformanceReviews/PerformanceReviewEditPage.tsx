"use client";

import { useCreateUpdate } from "@base/client/hooks/useCreateUpdate";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { performanceReviewService } from "@mdl/hrm/client/services/PerformanceReviewService";
import PerformanceReviewForm, {
  type PerformanceReviewFormValues,
} from "./components/PerformanceReviewForm/PerformanceReviewForm";
import { LoadingOverlay } from "@base/client/components";

export default function PerformanceReviewEditPage(): React.ReactNode {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations("hrm.performanceReviews");
  const tCommon = useTranslations("common");

  const {
    data: performanceReviewData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["hrm-performance-reviews", id],
    queryFn: async () => {
      const response = await performanceReviewService.getById(id);
      if (!response.data) {
        throw new Error(response.message ?? t("errors.failedToLoadPerformanceReview"));
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
        throw new Error(response.message ?? t("errors.failedToUpdatePerformanceReview"));
      }
      return { data: { id: response.data.id } };
    },
    invalidateQueries: [["hrm-performance-reviews"], ["hrm-performance-reviews", id]],
    onSuccess: (data) => {
      router.push(`/workspace/modules/hrm/.../view/${data.data.id}`);
    },
  });

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
    return <LoadingOverlay isLoading={true} />;
  }

  if (isError) {
    return (
      <div className="text-danger-500">
        {tCommon("errors.failedToLoadData")}: {error?.message}
      </div>
    );
  }

  if (!performanceReviewData) {
    return (
      <div className="text-warning-500">{tCommon("errors.dataNotFound")}</div>
    );
  }

  return (
    <PerformanceReviewForm
      onSubmit={handleSubmit}
      onCancel={() => router.push(`/workspace/modules/hrm/performance-reviews/view/${id}`)}
      submitError={submitError}
      isSubmitting={isPending}
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
    />
  );
}

