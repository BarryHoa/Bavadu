"use client";

import { LoadingOverlay } from "@base/client/components";
import { useCreateUpdate } from "@base/client/hooks/useCreateUpdate";
import { leaveTypeService } from "@mdl/hrm/client/services/LeaveTypeService";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";

import LeaveTypeForm, {
  type LeaveTypeFormValues,
} from "./components/LeaveTypeForm/LeaveTypeForm";

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
        throw new Error(
          response.message ?? t("errors.failedToUpdateLeaveType"),
        );
      }

      return { data: { id: response.data.id } };
    },
    invalidateQueries: [["hrm-leave-types"], ["hrm-leave-types", id]],
    onSuccess: (data) => {
      router.push(`/workspace/modules/hrm/leave-types/view/${data.data.id}`);
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
    return <LoadingOverlay isLoading={true} />;
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
      onCancel={() =>
        router.push(`/workspace/modules/hrm/leave-types/view/${id}`)
      }
      onSubmit={handleSubmit}
    />
  );
}
