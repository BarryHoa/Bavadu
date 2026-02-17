"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";

import { leaveRequestService } from "@mdl/hrm/client/services/LeaveRequestService";
import {
  useCreateUpdate,
  useSetBreadcrumbs,
} from "@base/client/hooks";
import { IBaseButton, IBasePageLayout, IBaseSpinner } from "@base/client";

import LeaveRequestForm, {
  type LeaveRequestFormValues,
} from "./components/LeaveRequestForm/LeaveRequestForm";

const LEAVE_REQUESTS_LIST_PATH = "/workspace/modules/hrm/leave-requests";

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

  const viewPath = `${LEAVE_REQUESTS_LIST_PATH}/view/${id}`;
  const breadcrumbs = useMemo(
    () => [
      { label: t("title"), href: LEAVE_REQUESTS_LIST_PATH },
      { label: leaveRequestData ? t("edit") : "..." },
    ],
    [t, leaveRequestData],
  );

  useSetBreadcrumbs(breadcrumbs);

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
      router.push(`${LEAVE_REQUESTS_LIST_PATH}/view/${data.data.id}`);
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
          color="danger"
          size="sm"
          variant="bordered"
          onPress={() => refetch()}
        >
          Retry
        </IBaseButton>
      </div>
    );
  }

  return (
    <IBasePageLayout
      maxWidth="form"
      subtitle={`${leaveRequestData.startDate} – ${leaveRequestData.endDate}`}
      title={t("edit")}
      variant="edit"
    >
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
        mode="edit"
        submitError={submitError}
        onCancel={() => router.push(viewPath)}
        onSubmit={handleSubmit}
      />
    </IBasePageLayout>
  );
}
