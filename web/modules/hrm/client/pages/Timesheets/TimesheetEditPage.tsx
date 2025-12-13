"use client";

import { useCreateUpdate } from "@base/client/hooks/useCreateUpdate";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { timesheetService } from "@mdl/hrm/client/services/TimesheetService";
import TimesheetForm, {
  type TimesheetFormValues,
} from "./components/TimesheetForm/TimesheetForm";
import { LoadingOverlay } from "@base/client/components";

export default function TimesheetEditPage(): React.ReactNode {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations("hrm.timesheets");
  const tCommon = useTranslations("common");

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
        throw new Error(response.message ?? t("errors.failedToUpdateTimesheet"));
      }
      return response.data;
    },
    invalidateQueries: [["hrm-timesheets"], ["hrm-timesheets", id]],
    onSuccess: (data) => {
      router.push(`/workspace/modules/hrm/timesheets/view/${data.id}`);
    },
  });

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
    <TimesheetForm
      onSubmit={handleSubmit}
      onCancel={() => router.push(`/workspace/modules/hrm/timesheets/view/${id}`)}
      submitError={submitError}
      isSubmitting={isPending}
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
    />
  );
}

