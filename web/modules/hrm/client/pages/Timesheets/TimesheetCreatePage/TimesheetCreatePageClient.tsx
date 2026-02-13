"use client";

import { IBasePageLayout } from "@base/client";
import { useCreateUpdate, useSetBreadcrumbs } from "@base/client/hooks";
import { timesheetService } from "@mdl/hrm/client/services/TimesheetService";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

import TimesheetForm, {
  type TimesheetFormValues,
} from "../components/TimesheetForm/TimesheetForm";

const TIMESHEETS_LIST_PATH = "/workspace/modules/hrm/timesheets";

export default function TimesheetCreatePageClient(): React.ReactNode {
  const router = useRouter();
  const t = useTranslations("hrm.timesheets");

  const breadcrumbs = useMemo(
    () => [
      { label: t("title"), href: TIMESHEETS_LIST_PATH },
      { label: t("create") },
    ],
    [t],
  );
  useSetBreadcrumbs(breadcrumbs);

  const {
    handleSubmit: submitTimesheet,
    error: submitError,
    isPending,
  } = useCreateUpdate<
    Parameters<typeof timesheetService.create>[0],
    { data: { id: string } }
  >({
    mutationFn: async (payload) => {
      const response = await timesheetService.create(payload);

      if (!response.data) {
        throw new Error(
          response.message ?? t("errors.failedToCreateTimesheet"),
        );
      }

      return { data: { id: response.data.id } };
    },
    invalidateQueries: [["hrm-timesheets"]],
    onSuccess: (data) => {
      router.push(`${TIMESHEETS_LIST_PATH}/view/${data.data.id}`);
    },
  });

  const handleSubmit = async (values: TimesheetFormValues) => {
    await submitTimesheet({
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

  return (
    <IBasePageLayout
      variant="create"
      maxWidth="form"
      title={t("create")}
    >
      <TimesheetForm
        isSubmitting={isPending}
        submitError={submitError}
        onCancel={() => router.push(TIMESHEETS_LIST_PATH)}
        onSubmit={handleSubmit}
      />
    </IBasePageLayout>
  );
}
