"use client";

import { useCreateUpdate } from "@base/client/hooks/useCreateUpdate";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { leaveTypeService } from "@mdl/hrm/client/services/LeaveTypeService";
import LeaveTypeForm, {
  type LeaveTypeFormValues,
} from "./components/LeaveTypeForm/LeaveTypeForm";
import { LoadingOverlay } from "@base/client/components";

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
        throw new Error(response.message ?? t("errors.failedToUpdateLeaveType"));
      }
      return response.data;
    },
    invalidateQueries: [["hrm-leave-types"], ["hrm-leave-types", id]],
    onSuccess: (data) => {
      router.push(`/workspace/modules/hrm/leave-types/view/${data.id}`);
    },
  });

  const handleSubmit = async (values: LeaveTypeFormValues) => {
    await submitLeaveType({
      id,
      code: values.code.trim(),
      name: values.name || { vi: "", en: "" },
      description: values.description || null,
      accrualType: values.accrualType.trim(),
      accrualRate: values.accrualRate || null,
      maxAccrual: values.maxAccrual || null,
      carryForward: values.carryForward === "true",
      maxCarryForward: values.maxCarryForward || null,
      requiresApproval: values.requiresApproval === "true",
      isPaid: values.isPaid === "true",
      isActive: values.isActive === "true",
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

  if (!leaveTypeData) {
    return (
      <div className="text-warning-500">{tCommon("errors.dataNotFound")}</div>
    );
  }

  return (
    <LeaveTypeForm
      onSubmit={handleSubmit}
      onCancel={() => router.push(`/workspace/modules/hrm/leave-types/view/${id}`)}
      submitError={submitError}
      isSubmitting={isPending}
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
    />
  );
}

