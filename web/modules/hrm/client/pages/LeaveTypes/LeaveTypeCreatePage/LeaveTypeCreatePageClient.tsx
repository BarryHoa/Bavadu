"use client";

import { IBasePageLayout } from "@base/client";
import { useCreateUpdate, useSetBreadcrumbs } from "@base/client/hooks";
import { leaveTypeService } from "@mdl/hrm/client/services/LeaveTypeService";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

import LeaveTypeForm, {
  type LeaveTypeFormValues,
} from "../components/LeaveTypeForm/LeaveTypeForm";

const LEAVE_TYPES_LIST_PATH = "/workspace/modules/hrm/leave-types";

export default function LeaveTypeCreatePageClient(): React.ReactNode {
  const router = useRouter();
  const t = useTranslations("hrm.leaveTypes");
  const tTitle = useTranslations("hrm.leaveTypes");

  const breadcrumbs = useMemo(
    () => [
      { label: tTitle("title"), href: LEAVE_TYPES_LIST_PATH },
      { label: t("create") },
    ],
    [t, tTitle],
  );
  useSetBreadcrumbs(breadcrumbs);

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
          response.message ?? t("errors.failedToCreateLeaveType"),
        );
      }

      return { data: { id: response.data.id } };
    },
    invalidateQueries: [["hrm-leave-types"]],
    onSuccess: (data) => {
      router.push(`${LEAVE_TYPES_LIST_PATH}/view/${data.data.id}`);
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
    <IBasePageLayout
      variant="create"
      maxWidth="form"
      title={t("create")}
    >
      <LeaveTypeForm
        isSubmitting={isPending}
        submitError={submitError}
        onCancel={() => router.push(LEAVE_TYPES_LIST_PATH)}
        onSubmit={handleSubmit}
      />
    </IBasePageLayout>
  );
}
