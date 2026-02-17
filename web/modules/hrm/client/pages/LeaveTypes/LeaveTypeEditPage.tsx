"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";

import { leaveTypeService } from "@mdl/hrm/client/services/LeaveTypeService";
import {
  useCreateUpdate,
  useSetBreadcrumbs,
} from "@base/client/hooks";
import { IBaseButton, IBasePageLayout, IBaseSpinner } from "@base/client";

import LeaveTypeForm, {
  type LeaveTypeFormValues,
} from "./components/LeaveTypeForm/LeaveTypeForm";

const LEAVE_TYPES_LIST_PATH = "/workspace/modules/hrm/leave-types";

export default function LeaveTypeEditPage(): React.ReactNode {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations("hrm.leaveTypes");
  const tCommon = useTranslations("common");

  const {
    data: leaveTypeData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["hrm-leave-types", id],
    queryFn: async () => {
      const response = await leaveTypeService.getById(id);

      if (!response.data) {
        throw new Error(response.message ?? t("errors.failedToLoadLeaveType"));
      }

      return response.data;
    },
    enabled: !!id,
  });

  const viewPath = `${LEAVE_TYPES_LIST_PATH}/view/${id}`;
  const breadcrumbs = useMemo(
    () => [
      { label: t("title"), href: LEAVE_TYPES_LIST_PATH },
      { label: leaveTypeData ? t("edit") : "..." },
    ],
    [t, leaveTypeData],
  );

  useSetBreadcrumbs(breadcrumbs);

  const {
    handleSubmit: submitLeaveType,
    error: submitError,
    isPending,
  } = useCreateUpdate<
    Parameters<typeof leaveTypeService.update>[0],
    { data: { id: string } }
  >({
    mutationFn: async (payload) => {
      const response = await leaveTypeService.update(payload);

      if (!response.data) {
        throw new Error(
          response.message ?? t("errors.failedToUpdateLeaveType"),
        );
      }

      return { data: { id: response.data.id } };
    },
    invalidateQueries: [["hrm-leave-types"], ["hrm-leave-types", id]],
    onSuccess: (data) => {
      router.push(`${LEAVE_TYPES_LIST_PATH}/view/${data.data.id}`);
    },
  });

  const handleSubmit = async (values: LeaveTypeFormValues) => {
    await submitLeaveType({
      id,
      code: typeof values.code === "string" ? values.code.trim() : undefined,
      name:
        values.name &&
        typeof values.name === "object" &&
        !Array.isArray(values.name) &&
        ("vi" in values.name || "en" in values.name)
          ? (values.name as { vi?: string; en?: string })
          : undefined,
      description:
        values.description &&
        typeof values.description === "object" &&
        !Array.isArray(values.description) &&
        (values.description === null ||
          "vi" in values.description ||
          "en" in values.description)
          ? (values.description as { vi?: string; en?: string } | null)
          : null,
      accrualType:
        typeof values.accrualType === "string"
          ? values.accrualType.trim()
          : undefined,
      accrualRate:
        typeof values.accrualRate === "number" ? values.accrualRate : null,
      maxAccrual:
        typeof values.maxAccrual === "number" ? values.maxAccrual : null,
      carryForward: values.carryForward === "true",
      maxCarryForward:
        typeof values.maxCarryForward === "number"
          ? values.maxCarryForward
          : null,
      requiresApproval: values.requiresApproval === "true",
      isPaid: values.isPaid === "true",
      isActive: values.isActive === "true",
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

  if (isError || !leaveTypeData) {
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
      subtitle={leaveTypeData.code}
      title={t("edit")}
      variant="edit"
    >
      <LeaveTypeForm
        defaultValues={{
          code: leaveTypeData.code,
          name: (leaveTypeData.name as any) || { vi: "", en: "" },
          description: leaveTypeData.description as any,
          accrualType: leaveTypeData.accrualType,
          accrualRate: leaveTypeData.accrualRate || undefined,
          maxAccrual: leaveTypeData.maxAccrual || undefined,
          carryForward: leaveTypeData.carryForward ? "true" : "false",
          maxCarryForward: leaveTypeData.maxCarryForward || undefined,
          requiresApproval: leaveTypeData.requiresApproval ? "true" : "false",
          isPaid: leaveTypeData.isPaid ? "true" : "false",
          isActive: leaveTypeData.isActive ? "true" : "false",
        }}
        isSubmitting={isPending}
        submitError={submitError}
        onCancel={() => router.push(viewPath)}
        onSubmit={handleSubmit}
      />
    </IBasePageLayout>
  );
}
