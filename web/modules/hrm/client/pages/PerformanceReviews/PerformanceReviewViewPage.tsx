"use client";

import {
  IBaseButton,
  IBaseCard,
  IBaseCardBody,
  IBasePageLayout,
  IBaseSpinner,
} from "@base/client";
import { IBaseDigitViewer } from "@base/client/components";
import { useLocalizedText, useSetBreadcrumbs } from "@base/client/hooks";
import { formatDate } from "@base/client/utils/date/formatDate";
import { useQuery } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { performanceReviewService } from "@mdl/hrm/client/services/PerformanceReviewService";

const PERFORMANCE_REVIEWS_LIST_PATH = "/workspace/modules/hrm/performance-reviews";

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
                t("generalInfo"),
            },
          ]
        : [
            { label: t("title"), href: PERFORMANCE_REVIEWS_LIST_PATH },
            { label: isLoading ? "..." : tCommon("errors.dataNotFound") },
          ],
    [t, performanceReviewData, isLoading, tCommon, getLocalizedText],
  );
  useSetBreadcrumbs(breadcrumbs);

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

  const titleLabel =
    getLocalizedText(performanceReviewData.employee?.fullName) ||
    performanceReviewData.employee?.employeeCode ||
    performanceReviewData.reviewType ||
    t("generalInfo");
  const subtitle = [
    formatDate(performanceReviewData.reviewDate),
    performanceReviewData.status,
  ].filter(Boolean).join(" · ");
  const editPath = `${PERFORMANCE_REVIEWS_LIST_PATH}/edit/${id}`;

  return (
    <IBasePageLayout
      variant="detail"
      maxWidth="content"
      title={titleLabel}
      subtitle={subtitle || undefined}
      headerActions={
        <IBaseButton
          color="primary"
          size="sm"
          startContent={<Pencil className="size-4" />}
          onPress={() => router.push(editPath)}
        >
          {tCommon("actions.edit")}
        </IBaseButton>
      }
    >
      <IBaseCard className="border border-default-200/60 shadow-sm">
        <IBaseCardBody className="gap-6 p-6">
          <h2 className="text-lg font-semibold text-foreground">{t("generalInfo")}</h2>
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
        </IBaseCardBody>
      </IBaseCard>
    </IBasePageLayout>
  );
}
