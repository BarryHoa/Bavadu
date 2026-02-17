"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

import { IBasePageLayout } from "@base/client";
import { useCreateUpdate, useSetBreadcrumbs } from "@base/client/hooks";
import { leaveRequestService } from "@mdl/hrm/client/services/LeaveRequestService";

import LeaveRequestForm, {
  type LeaveRequestFormValues,
} from "../components/LeaveRequestForm/LeaveRequestForm";

const LEAVE_REQUESTS_LIST_PATH = "/workspace/modules/hrm/leave-requests";

export default function LeaveRequestCreatePageClient(): React.ReactNode {
  const router = useRouter();
  const t = useTranslations("hrm.leaveRequests");
  const tTitle = useTranslations("hrm.leaveRequests");

  const breadcrumbs = useMemo(
    () => [
      { label: tTitle("title"), href: LEAVE_REQUESTS_LIST_PATH },
      { label: t("create") },
    ],
    [t, tTitle],
  );

  useSetBreadcrumbs(breadcrumbs);

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
      router.push(`${LEAVE_REQUESTS_LIST_PATH}/view/${data.data.id}`);
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
    <IBasePageLayout
      maxWidth="form"
      title={t("create")}
      variant="create"
    >
      <LeaveRequestForm
        isSubmitting={isPending}
        mode="create"
        submitError={submitError}
        onCancel={() => router.push(LEAVE_REQUESTS_LIST_PATH)}
        onSubmit={handleSubmit}
      />
    </IBasePageLayout>
  );
}
