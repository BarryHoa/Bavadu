"use client";

import { IBaseButton, IBasePageLayout, IBaseSpinner } from "@base/client";
import { useCreateUpdate, useLocalizedText, useSetBreadcrumbs } from "@base/client/hooks";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import { timesheetService } from "@mdl/hrm/client/services/TimesheetService";

import TimesheetForm, {
  type TimesheetFormValues,
} from "./components/TimesheetForm/TimesheetForm";

const TIMESHEETS_LIST_PATH = "/workspace/modules/hrm/timesheets";

export default function TimesheetEditPage(): React.ReactNode {
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

  const {
    handleSubmit: submitTimesheet,
    error: submitError,
    isPending,
  } = useCreateUpdate<
    Parameters<typeof timesheetService.update>[0],
    { data: { id: string } }
  >({
    mutationFn: async (payload) => {
      const response = await timesheetService.update(payload);

      if (!response.data) {
        throw new Error(
          response.message ?? t("errors.failedToUpdateTimesheet"),
        );
      }

      return { data: { id: response.data.id } };
    },
    invalidateQueries: [["hrm-timesheets"], ["hrm-timesheets", id]],
    onSuccess: (data) => {
      router.push(`${TIMESHEETS_LIST_PATH}/view/${data.data.id}`);
    },
  });

  const viewPath = `${TIMESHEETS_LIST_PATH}/view/${id}`;
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
                t("edit"),
              href: viewPath,
            },
            { label: t("edit") },
          ]
        : [
            { label: t("title"), href: TIMESHEETS_LIST_PATH },
            { label: t("edit") },
          ],
    [t, timesheetData, viewPath, getLocalizedText],
  );
  useSetBreadcrumbs(breadcrumbs);

  const handleSubmit = async (values: TimesheetFormValues) => {
    await submitTimesheet({
      id,
      employeeId: values.employeeId.trim(),
      rosterId: values.rosterId?.trim() || null,
      workDate: values.workDate.trim(),
      shiftId: values.shiftId?.trim() || null,
      checkInTime: values.checkInTime?.trim() || null,
      checkOutTime: values.checkOutTime?.trim() || null,
      breakDuration: values.breakDuration || 0,
      status: values.status || "pending",
      checkInMethod: values.checkInMethod?.trim() || null,
      checkOutMethod: values.checkOutMethod?.trim() || null,
      checkInLocation: values.checkInLocation?.trim() || null,
      checkOutLocation: values.checkOutLocation?.trim() || null,
      notes: values.notes?.trim() || null,
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

  const subtitle = [
    getLocalizedText(timesheetData.employee?.fullName) || timesheetData.employee?.employeeCode,
    timesheetData.workDate,
  ].filter(Boolean).join(" · ");

  return (
    <IBasePageLayout
      variant="edit"
      maxWidth="form"
      title={t("edit")}
      subtitle={subtitle || undefined}
    >
      <TimesheetForm
      defaultValues={{
        employeeId: timesheetData.employeeId,
        rosterId: timesheetData.rosterId || "",
        workDate: timesheetData.workDate,
        shiftId: timesheetData.shiftId || "",
        checkInTime: timesheetData.checkInTime
          ? new Date(timesheetData.checkInTime).toISOString().slice(0, 16)
          : "",
        checkOutTime: timesheetData.checkOutTime
          ? new Date(timesheetData.checkOutTime).toISOString().slice(0, 16)
          : "",
        breakDuration: timesheetData.breakDuration || 0,
        status: timesheetData.status,
        checkInMethod: timesheetData.checkInMethod || "",
        checkOutMethod: timesheetData.checkOutMethod || "",
        checkInLocation: timesheetData.checkInLocation || "",
        checkOutLocation: timesheetData.checkOutLocation || "",
        notes: timesheetData.notes || "",
      }}
      isSubmitting={isPending}
      submitError={submitError}
      onCancel={() => router.push(viewPath)}
        onSubmit={handleSubmit}
      />
    </IBasePageLayout>
  );
}
