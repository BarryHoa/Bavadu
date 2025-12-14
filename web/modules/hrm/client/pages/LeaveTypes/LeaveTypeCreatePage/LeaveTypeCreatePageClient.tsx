"use client";

import { useCreateUpdate } from "@base/client/hooks/useCreateUpdate";
import { leaveTypeService } from "@mdl/hrm/client/services/LeaveTypeService";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
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
        throw new Error(
          response.message ?? t("errors.failedToCreateLeaveType")
        );
      }
      return { data: { id: response.data.id } };
    },
    invalidateQueries: [["hrm-leave-types"]],
    onSuccess: (data) => {
      router.push(`/workspace/modules/hrm/leave-types/view/${data.data.id}`);
    },
  });

  const handleSubmit = async (values: LeaveTypeFormValues) => {
    await submitLeaveType({
      code: typeof values.code === "string" ? values.code.trim() : "",
      name:
        values.name &&
        typeof values.name === "object" &&
        !Array.isArray(values.name) &&
        ("vi" in values.name || "en" in values.name)
          ? (values.name as { vi?: string; en?: string })
          : { vi: "", en: "" },
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
        typeof values.accrualType === "string" ? values.accrualType.trim() : "",
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

  return (
    <LeaveTypeForm
      onSubmit={handleSubmit}
      onCancel={() => router.push("/workspace/modules/hrm/leave-types")}
      submitError={submitError}
      isSubmitting={isPending}
    />
  );
}
