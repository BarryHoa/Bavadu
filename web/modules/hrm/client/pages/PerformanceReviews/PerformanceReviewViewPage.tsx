"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { performanceReviewService } from "@mdl/hrm/client/services/PerformanceReviewService";
import { Button } from "@base/client";
import { Card, CardBody } from "@base/client";
import { LoadingOverlay, IBaseDigitViewer } from "@base/client/components";
import { useLocalizedText } from "@base/client/hooks/useLocalizedText";
import { formatDate } from "@base/client/utils/date/formatDate";

export default function PerformanceReviewViewPage(): React.ReactNode {
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
    <div className="space-y-4">
      <div className="sticky top-0 z-10 flex justify-end gap-3 py-2 mb-3 bg-background border-b border-divider -mx-4 px-4">
        <Button
          size="sm"
          variant="light"
          onPress={() =>
            router.push("/workspace/modules/hrm/performance-reviews")
          }
        >
          {tCommon("actions.backToList")}
        </Button>
        <Button
          color="primary"
          size="sm"
          onPress={() =>
            router.push(`/workspace/modules/hrm/performance-reviews/edit/${id}`)
          }
        >
          {tCommon("actions.edit")}
        </Button>
      </div>

      <Card>
        <CardBody className="p-4">
          <h2 className="text-base font-semibold mb-2">{t("generalInfo")}</h2>
          <div className="grid gap-2 md:grid-cols-2">
            <IBaseDigitViewer
              label={t("labels.employee")}
              value={
                getLocalizedText(performanceReviewData.employee?.fullName) ||
                performanceReviewData.employee?.employeeCode
              }
            />
            <IBaseDigitViewer
              label={t("labels.reviewType")}
              value={performanceReviewData.reviewType}
            />
            <IBaseDigitViewer
              label={t("labels.reviewPeriod")}
              value={performanceReviewData.reviewPeriod || "—"}
            />
            <IBaseDigitViewer
              label={t("labels.reviewDate")}
              value={formatDate(performanceReviewData.reviewDate)}
            />
            <IBaseDigitViewer
              label={t("labels.reviewer")}
              value={
                getLocalizedText(performanceReviewData.reviewer?.fullName) ||
                performanceReviewData.reviewer?.employeeCode
              }
            />
            <IBaseDigitViewer
              label={t("labels.overallRating")}
              value={
                performanceReviewData.overallRating
                  ? `${performanceReviewData.overallRating}/5`
                  : "—"
              }
            />
            <IBaseDigitViewer
              label={t("labels.status")}
              value={performanceReviewData.status}
            />
            <IBaseDigitViewer
              label={t("labels.completedDate")}
              value={formatDate(performanceReviewData.completedDate)}
            />
            <div className="md:col-span-2">
              <IBaseDigitViewer
                label={t("labels.strengths")}
                value={performanceReviewData.strengths || "—"}
              />
            </div>
            <div className="md:col-span-2">
              <IBaseDigitViewer
                label={t("labels.areasForImprovement")}
                value={performanceReviewData.areasForImprovement || "—"}
              />
            </div>
            <div className="md:col-span-2">
              <IBaseDigitViewer
                label={t("labels.feedback")}
                value={performanceReviewData.feedback || "—"}
              />
            </div>
            <div className="md:col-span-2">
              <IBaseDigitViewer
                label={t("labels.employeeComments")}
                value={performanceReviewData.employeeComments || "—"}
              />
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
