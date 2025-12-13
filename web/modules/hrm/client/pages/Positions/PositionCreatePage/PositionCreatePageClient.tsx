"use client";

import { useCreateUpdate } from "@base/client/hooks/useCreateUpdate";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { positionService } from "../../../../services/PositionService";
import PositionForm, {
  type PositionFormValues,
} from "../components/PositionForm/PositionForm";

export default function PositionCreatePageClient(): React.ReactNode {
  const router = useRouter();
  const t = useTranslations("hrm.position.create.labels");

  const {
    handleSubmit: submitPosition,
    error: submitError,
    isPending,
  } = useCreateUpdate<
    Parameters<typeof positionService.create>[0],
    { id: string }
  >({
    mutationFn: async (payload) => {
      const response = await positionService.create(payload);
      if (!response.data) {
        throw new Error(response.message ?? t("errors.failedToCreate"));
      }
      return response.data;
    },
    invalidateQueries: [["hrm-positions"]],
    onSuccess: (data) => {
      router.push(`/workspace/modules/hrm/positions/view/${data.id}`);
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
    <PositionForm
      onSubmit={handleSubmit}
      onCancel={() => router.push("/workspace/modules/hrm/positions")}
      submitError={submitError}
      isSubmitting={isPending}
    />
  );
}

