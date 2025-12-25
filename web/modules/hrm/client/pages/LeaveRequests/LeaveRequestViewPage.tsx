"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { leaveRequestService } from "@mdl/hrm/client/services/LeaveRequestService";
import { Button } from "@base/client";
import { Card, CardBody } from "@base/client";
import { LoadingOverlay, IBaseDigitViewer } from "@base/client/components";
import { useLocalizedText } from "@base/client/hooks/useLocalizedText";
import { formatDate } from "@base/client/utils/date/formatDate";

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

  if (!leaveRequestData) {
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
          onPress={() => router.push("/workspace/modules/hrm/leave-requests")}
        >
          {tCommon("actions.backToList")}
        </Button>
        <Button
          color="primary"
          size="sm"
          onPress={() =>
            router.push(`/workspace/modules/hrm/leave-requests/edit/${id}`)
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
        </CardBody>
      </Card>
    </div>
  );
}
