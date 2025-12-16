"use client";

import { LoadingOverlay } from "@base/client/components";
import { useCreateUpdate } from "@base/client/hooks/useCreateUpdate";
import { leaveRequestService } from "@mdl/hrm/client/services/LeaveRequestService";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";

import LeaveRequestForm, {
  type LeaveRequestFormValues,
} from "./components/LeaveRequestForm/LeaveRequestForm";

export default function LeaveRequestEditPage(): React.ReactNode {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations("hrm.leaveRequests");
  const tCommon = useTranslations("common");

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

  const {
    handleSubmit: submitLeaveRequest,
    error: submitError,
    isPending,
  } = useCreateUpdate<
    Parameters<typeof leaveRequestService.update>[0],
    { data: { id: string } }
  >({
    mutationFn: async (payload) => {
      const response = await leaveRequestService.update(payload);

      if (!response.data) {
        throw new Error(
          response.message ?? t("errors.failedToUpdateLeaveRequest"),
        );
      }

      return { data: { id: response.data.id } };
    },
    invalidateQueries: [["hrm-leave-requests"], ["hrm-leave-requests", id]],
    onSuccess: (data) => {
      router.push(`/workspace/modules/hrm/leave-requests/view/${data.data.id}`);
    },
  });

  const handleSubmit = async (values: LeaveRequestFormValues) => {
    await submitLeaveRequest({
      id,
      employeeId: values.employeeId.trim(),
      leaveTypeId: values.leaveTypeId.trim(),
      startDate: values.startDate.trim(),
      endDate: values.endDate.trim(),
      days: values.days,
      reason: values.reason?.trim() || null,
      status: values.status || "pending",
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

  if (!leaveRequestData) {
    return (
      <div className="text-warning-500">{tCommon("errors.dataNotFound")}</div>
    );
  }

  return (
    <LeaveRequestForm
      defaultValues={{
        employeeId: leaveRequestData.employeeId,
        leaveTypeId: leaveRequestData.leaveTypeId,
        startDate: leaveRequestData.startDate,
        endDate: leaveRequestData.endDate,
        days: leaveRequestData.days,
        reason: leaveRequestData.reason || "",
        status: leaveRequestData.status,
      }}
      isSubmitting={isPending}
      submitError={submitError}
      onCancel={() =>
        router.push(`/workspace/modules/hrm/leave-requests/view/${id}`)
      }
      onSubmit={handleSubmit}
    />
  );
}
