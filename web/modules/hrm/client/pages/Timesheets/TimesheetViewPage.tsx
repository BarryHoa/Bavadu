"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { timesheetService } from "@mdl/hrm/client/services/TimesheetService";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/react";
import { LoadingOverlay, IBaseDigitViewer } from "@base/client/components";
import { useLocalizedText } from "@base/client/hooks/useLocalizedText";
import { formatDate } from "@base/client/utils/date/formatDate";

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

  if (isLoading) {
    return <LoadingOverlay />;
  }

  if (isError) {
    return (
      <div className="text-danger-500">
        {tCommon("errors.failedToLoadData")}: {error?.message}
      </div>
    );
  }

  if (!timesheetData) {
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
          onPress={() => router.push("/workspace/modules/hrm/timesheets")}
        >
          {tCommon("actions.backToList")}
        </Button>
        <Button
          color="primary"
          size="sm"
          onPress={() =>
            router.push(`/workspace/modules/hrm/timesheets/edit/${id}`)
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
              value={getLocalizedText(timesheetData.employee?.fullName) || timesheetData.employee?.employeeCode}
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
              value={timesheetData.checkInTime ? formatDate(timesheetData.checkInTime) : "—"}
            />
            <IBaseDigitViewer
              label={t("labels.checkOutTime")}
              value={timesheetData.checkOutTime ? formatDate(timesheetData.checkOutTime) : "—"}
            />
            <IBaseDigitViewer
              label={t("labels.actualHours")}
              value={timesheetData.actualHours ? `${timesheetData.actualHours}h` : "—"}
            />
            <IBaseDigitViewer
              label={t("labels.regularHours")}
              value={timesheetData.regularHours ? `${timesheetData.regularHours}h` : "—"}
            />
            <IBaseDigitViewer
              label={t("labels.overtimeHours")}
              value={timesheetData.overtimeHours ? `${timesheetData.overtimeHours}h` : "—"}
            />
            <IBaseDigitViewer
              label={t("labels.breakDuration")}
              value={timesheetData.breakDuration ? `${timesheetData.breakDuration} phút` : "—"}
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
        </CardBody>
      </Card>
    </div>
  );
}

