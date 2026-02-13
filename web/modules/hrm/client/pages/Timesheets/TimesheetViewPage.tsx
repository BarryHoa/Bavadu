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
import { timesheetService } from "@mdl/hrm/client/services/TimesheetService";

const TIMESHEETS_LIST_PATH = "/workspace/modules/hrm/timesheets";

export default function TimesheetViewPage(): React.ReactNode {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations("hrm.timesheets");
  const tCommon = useTranslations("common");
  const getLocalizedText = useLocalizedText();

  const {
    data: timesheetData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["hrm-timesheets", id],
    queryFn: async () => {
      const response = await timesheetService.getById(id);

      if (!response.data) {
        throw new Error(response.message ?? t("errors.failedToLoadTimesheet"));
      }

      return response.data;
    },
    enabled: !!id,
  });

  const breadcrumbs = useMemo(
    () =>
      timesheetData
        ? [
            { label: t("title"), href: TIMESHEETS_LIST_PATH },
            {
              label:
                getLocalizedText(timesheetData.employee?.fullName) ||
                timesheetData.employee?.employeeCode ||
                timesheetData.workDate ||
                t("generalInfo"),
            },
          ]
        : [
            { label: t("title"), href: TIMESHEETS_LIST_PATH },
            { label: isLoading ? "..." : tCommon("errors.dataNotFound") },
          ],
    [t, timesheetData, isLoading, tCommon, getLocalizedText],
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

  if (isError || !timesheetData) {
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
    getLocalizedText(timesheetData.employee?.fullName) ||
    timesheetData.employee?.employeeCode ||
    formatDate(timesheetData.workDate) ||
    t("generalInfo");
  const subtitle = [formatDate(timesheetData.workDate), timesheetData.status].filter(Boolean).join(" · ");
  const editPath = `${TIMESHEETS_LIST_PATH}/edit/${id}`;

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
          <h2 className="text-base font-semibold mb-2">{t("generalInfo")}</h2>
          <div className="grid gap-2 md:grid-cols-2">
            <IBaseDigitViewer
              label={t("labels.employee")}
              value={
                getLocalizedText(timesheetData.employee?.fullName) ||
                timesheetData.employee?.employeeCode
              }
            />
            <IBaseDigitViewer
              label={t("labels.workDate")}
              value={formatDate(timesheetData.workDate)}
            />
            <IBaseDigitViewer
              label={t("labels.shift")}
              value={getLocalizedText(timesheetData.shift?.name)}
            />
            <IBaseDigitViewer
              label={t("labels.checkInTime")}
              value={
                timesheetData.checkInTime
                  ? formatDate(timesheetData.checkInTime)
                  : "—"
              }
            />
            <IBaseDigitViewer
              label={t("labels.checkOutTime")}
              value={
                timesheetData.checkOutTime
                  ? formatDate(timesheetData.checkOutTime)
                  : "—"
              }
            />
            <IBaseDigitViewer
              label={t("labels.actualHours")}
              value={
                timesheetData.actualHours
                  ? `${timesheetData.actualHours}h`
                  : "—"
              }
            />
            <IBaseDigitViewer
              label={t("labels.regularHours")}
              value={
                timesheetData.regularHours
                  ? `${timesheetData.regularHours}h`
                  : "—"
              }
            />
            <IBaseDigitViewer
              label={t("labels.overtimeHours")}
              value={
                timesheetData.overtimeHours
                  ? `${timesheetData.overtimeHours}h`
                  : "—"
              }
            />
            <IBaseDigitViewer
              label={t("labels.breakDuration")}
              value={
                timesheetData.breakDuration
                  ? `${timesheetData.breakDuration} phút`
                  : "—"
              }
            />
            <IBaseDigitViewer
              label={t("labels.status")}
              value={timesheetData.status}
            />
            <IBaseDigitViewer
              label={t("labels.checkInMethod")}
              value={timesheetData.checkInMethod || "—"}
            />
            <IBaseDigitViewer
              label={t("labels.checkOutMethod")}
              value={timesheetData.checkOutMethod || "—"}
            />
            <IBaseDigitViewer
              label={t("labels.checkInLocation")}
              value={timesheetData.checkInLocation || "—"}
            />
            <IBaseDigitViewer
              label={t("labels.checkOutLocation")}
              value={timesheetData.checkOutLocation || "—"}
            />
            <IBaseDigitViewer
              label={t("labels.notes")}
              value={timesheetData.notes || "—"}
            />
          </div>
        </IBaseCardBody>
      </IBaseCard>
    </IBasePageLayout>
  );
}
