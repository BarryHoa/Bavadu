"use client";

import {
  IBaseButton,
  IBaseCard,
  IBaseCardBody,
  IBasePageLayout,
  IBaseSpinner,
} from "@base/client";
import { LoadingOverlay, IBaseDigitViewer } from "@base/client/components";
import { useLocalizedText, useSetBreadcrumbs } from "@base/client/hooks";
import { formatDate } from "@base/client/utils/date/formatDate";
import { leaveRequestService } from "@mdl/hrm/client/services/LeaveRequestService";
import { Pencil } from "lucide-react";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

const LEAVE_REQUESTS_LIST_PATH = "/workspace/modules/hrm/leave-requests";

export default function LeaveRequestViewPage(): React.ReactNode {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations("hrm.leaveRequests");
  const tCommon = useTranslations("common");
  const getLocalizedText = useLocalizedText();

  const {
    data: leaveRequestData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["hrm-leave-requests", id],
    queryFn: async () => {
      const response = await leaveRequestService.getById(id);

      if (!response.data) {
        throw new Error(
          response.message ?? t("errors.failedToLoadLeaveRequest"),
        );
      }

      return response.data;
    },
    enabled: !!id,
  });

  const breadcrumbs = useMemo(
    () =>
      leaveRequestData
        ? [
            { label: t("title"), href: LEAVE_REQUESTS_LIST_PATH },
            {
              label:
                getLocalizedText(leaveRequestData.employee?.fullName) ||
                leaveRequestData.employee?.employeeCode ||
                `Leave Request ${id}`,
              href: `${LEAVE_REQUESTS_LIST_PATH}/view/${id}`,
            },
          ]
        : [
            { label: t("title"), href: LEAVE_REQUESTS_LIST_PATH },
            { label: isLoading ? "..." : "Leave Request" },
          ],
    [t, leaveRequestData, id, isLoading, getLocalizedText],
  );
  useSetBreadcrumbs(breadcrumbs);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-default-500">
        <IBaseSpinner size="md" />
        <span>Loading...</span>
      </div>
    );
  }

  if (isError || !leaveRequestData) {
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

  const title =
    getLocalizedText(leaveRequestData.employee?.fullName) ||
    leaveRequestData.employee?.employeeCode ||
    `Leave Request`;
  const subtitle = `${leaveRequestData.startDate} – ${leaveRequestData.endDate} · ${leaveRequestData.days} ${t("labels.day")}`;
  const editPath = `${LEAVE_REQUESTS_LIST_PATH}/edit/${id}`;

  return (
    <IBasePageLayout
      variant="detail"
      maxWidth="content"
      title={title}
      subtitle={subtitle}
      headerActions={
        <IBaseButton
          color="primary"
          size="md"
          startContent={<Pencil size={16} />}
          onPress={() => router.push(editPath)}
        >
          {tCommon("actions.edit")}
        </IBaseButton>
      }
    >
      <IBaseCard className="border border-default-200/60 shadow-sm">
        <IBaseCardBody className="gap-6 p-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {t("generalInfo")}
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <IBaseDigitViewer
              label={t("labels.employee")}
              value={
                getLocalizedText(leaveRequestData.employee?.fullName) ||
                leaveRequestData.employee?.employeeCode
              }
            />
            <IBaseDigitViewer
              label={t("labels.leaveType")}
              value={getLocalizedText(leaveRequestData.leaveType?.name)}
            />
            <IBaseDigitViewer
              label={t("labels.startDate")}
              value={formatDate(leaveRequestData.startDate)}
            />
            <IBaseDigitViewer
              label={t("labels.endDate")}
              value={formatDate(leaveRequestData.endDate)}
            />
            <IBaseDigitViewer
              label={t("labels.days")}
              value={`${leaveRequestData.days} ${t("labels.day")}`}
            />
            <IBaseDigitViewer
              label={t("labels.status")}
              value={leaveRequestData.status}
            />
            <IBaseDigitViewer
              label={t("labels.reason")}
              value={leaveRequestData.reason || "—"}
            />
            {leaveRequestData.approvedAt && (
              <IBaseDigitViewer
                label={t("labels.approvedAt")}
                value={formatDate(leaveRequestData.approvedAt)}
              />
            )}
            {leaveRequestData.rejectedAt && (
              <>
                <IBaseDigitViewer
                  label={t("labels.rejectedAt")}
                  value={formatDate(leaveRequestData.rejectedAt)}
                />
                <IBaseDigitViewer
                  label={t("labels.rejectionReason")}
                  value={leaveRequestData.rejectionReason || "—"}
                />
              </>
            )}
          </div>
        </IBaseCardBody>
      </IBaseCard>
    </IBasePageLayout>
  );
}
