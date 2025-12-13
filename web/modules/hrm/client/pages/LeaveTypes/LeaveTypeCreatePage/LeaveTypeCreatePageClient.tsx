"use client";

import { useCreateUpdate } from "@base/client/hooks/useCreateUpdate";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { leaveTypeService } from "@mdl/hrm/client/services/LeaveTypeService";
import LeaveTypeForm, {
  type LeaveTypeFormValues,
} from "../components/LeaveTypeForm/LeaveTypeForm";

export default function LeaveTypeCreatePageClient(): React.ReactNode {
  const router = useRouter();
  const t = useTranslations("hrm.leaveTypes");

  const {
    handleSubmit: submitLeaveType,
    error: submitError,
    isPending,
  } = useCreateUpdate<
    Parameters<typeof leaveTypeService.create>[0],
    { data: { id: string } }
  >({
    mutationFn: async (payload) => {
      const response = await leaveTypeService.create(payload);
      if (!response.data) {
        throw new Error(response.message ?? t("errors.failedToCreateLeaveType"));
      }
      return response.data;
    },
    invalidateQueries: [["hrm-leave-types"]],
    onSuccess: (data) => {
      router.push(`/workspace/modules/hrm/leave-types/view/${data.id}`);
    },
  });

  const handleSubmit = async (values: LeaveTypeFormValues) => {
    await submitLeaveType({
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

  return (
    <LeaveTypeForm
      onSubmit={handleSubmit}
      onCancel={() => router.push("/workspace/modules/hrm/leave-types")}
      submitError={submitError}
      isSubmitting={isPending}
    />
  );
}

