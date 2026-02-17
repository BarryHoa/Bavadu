"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

import { IBasePageLayout } from "@base/client";
import { useCreateUpdate, useSetBreadcrumbs } from "@base/client/hooks";
import { positionService } from "@mdl/hrm/client/services/PositionService";

import PositionForm, {
  type PositionFormValues,
} from "../components/PositionForm/PositionForm";

const POSITIONS_LIST_PATH = "/workspace/modules/hrm/positions";

export default function PositionCreatePageClient(): React.ReactNode {
  const router = useRouter();
  const t = useTranslations("hrm.position.create.labels");
  const tTitle = useTranslations("hrm.position");

  const breadcrumbs = useMemo(
    () => [
      { label: tTitle("title"), href: POSITIONS_LIST_PATH },
      { label: t("pageTitle") },
    ],
    [t, tTitle],
  );

  useSetBreadcrumbs(breadcrumbs);

  const {
    handleSubmit: submitPosition,
    error: submitError,
    isPending,
  } = useCreateUpdate<
    Parameters<typeof positionService.create>[0],
    { data: { id: string } }
  >({
    mutationFn: async (payload) => {
      const response = await positionService.create(payload);

      if (!response.data) {
        throw new Error(response.message ?? t("errors.failedToCreate"));
      }

      return { data: { id: response.data.id } };
    },
    invalidateQueries: [["hrm-positions"]],
    onSuccess: (data) => {
      router.push(`${POSITIONS_LIST_PATH}/view/${data.data.id}`);
    },
  });

  const handleSubmit = async (values: PositionFormValues) => {
    const payload = {
      code: values.code.trim(),
      name: values.name || { vi: "", en: "" },
      description: values.description || null,
      departmentId: values.departmentId.trim(),
      jobFamily: values.jobFamily?.trim() || null,
      jobGrade: values.jobGrade?.trim() || null,
      reportsTo: values.reportsTo?.trim() || null,
      minSalary: values.minSalary ? Number(values.minSalary) : null,
      maxSalary: values.maxSalary ? Number(values.maxSalary) : null,
      isActive: values.isActive ?? true,
    };

    await submitPosition(payload);
  };

  return (
    <IBasePageLayout
      maxWidth="form"
      title={t("pageTitle")}
      variant="create"
    >
      <PositionForm
        isSubmitting={isPending}
        submitError={submitError}
        onCancel={() => router.push(POSITIONS_LIST_PATH)}
        onSubmit={handleSubmit}
      />
    </IBasePageLayout>
  );
}
