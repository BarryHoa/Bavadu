"use client";

import { useCreateUpdate } from "@base/client/hooks/useCreateUpdate";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { leaveRequestService } from "@mdl/hrm/client/services/LeaveRequestService";

import LeaveRequestForm, {
  type LeaveRequestFormValues,
} from "../components/LeaveRequestForm/LeaveRequestForm";

export default function LeaveRequestCreatePageClient(): React.ReactNode {
  const router = useRouter();
  const t = useTranslations("hrm.leaveRequests");

  const {
    handleSubmit: submitLeaveRequest,
    error: submitError,
    isPending,
  } = useCreateUpdate<
    Parameters<typeof leaveRequestService.create>[0],
    { data: { id: string } }
  >({
    mutationFn: async (payload) => {
      const response = await leaveRequestService.create(payload);

      if (!response.data) {
        throw new Error(
          response.message ?? t("errors.failedToCreateLeaveRequest"),
        );
      }

      return { data: { id: response.data.id } };
    },
    invalidateQueries: [["hrm-leave-requests"]],
    onSuccess: (data) => {
      router.push(`/workspace/modules/hrm/leave-requests/view/${data.data.id}`);
    },
  });

  const handleSubmit = async (values: LeaveRequestFormValues) => {
    await submitLeaveRequest({
      employeeId: values.employeeId.trim(),
      leaveTypeId: values.leaveTypeId.trim(),
      startDate: values.startDate.trim(),
      endDate: values.endDate.trim(),
      days: values.days,
      reason: values.reason?.trim() || null,
      status: values.status || "pending",
    });
  };

  return (
    <LeaveRequestForm
      mode="create"
      isSubmitting={isPending}
      submitError={submitError}
      onCancel={() => router.push("/workspace/modules/hrm/leave-requests")}
      onSubmit={handleSubmit}
    />
  );
}
